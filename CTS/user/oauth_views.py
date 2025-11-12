from django.shortcuts import redirect
from django.conf import settings
from django.urls import reverse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .utils.google_auth import (
    create_oauth_flow,
    credentials_to_dict,
    get_google_drive_service,
    create_cts_root_folder
)

from django.middleware.csrf import get_token

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_google_auth(request):
    """Start the Google OAuth flow."""
    # Ensure we have a fresh session
    request.session.flush()
    request.session.create()
    request.session.modified = True
    
    # Generate CSRF token
    get_token(request)
    
    # Store user ID and timestamp in session
    request.session['oauth_user_id'] = request.user.id
    request.session['oauth_initiated_at'] = str(timezone.now())
    
    callback_uri = request.build_absolute_uri(reverse('google-oauth-callback'))
    flow = create_oauth_flow(callback_uri)
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'  # Force consent screen to appear
    )
    
    # Store state in session
    request.session['oauth_state'] = state
    request.session.modified = True
    
    # Debug logging
    print(f"Session ID: {request.session.session_key}")
    print(f"Storing state in session: {state}")
    print(f"Current session data: {dict(request.session)}")
    
    # Create response with authorization URL
    response = Response({
        'authorization_url': authorization_url,
        'session_id': request.session.session_key  # Include session ID in response for debugging
    })
    
    # Ensure the session cookie is included in the response
    response.set_cookie(
        settings.SESSION_COOKIE_NAME,
        request.session.session_key,
        max_age=settings.SESSION_COOKIE_AGE,
        domain=None,
        secure=settings.SESSION_COOKIE_SECURE,
        httponly=settings.SESSION_COOKIE_HTTPONLY,
        samesite=settings.SESSION_COOKIE_SAMESITE
    )
    
    return response

from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from django.core.exceptions import PermissionDenied
from django.utils import timezone
import jwt
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_callback(request):
    """Handle the OAuth callback from Google."""
    if 'error' in request.query_params:
        return Response({'error': 'Authorization failed'}, status=400)

    # Log session information
    print(f"Session ID: {request.session.session_key}")
    print(f"Session contents: {dict(request.session)}")
    
    # Get and validate state
    received_state = request.query_params.get('state')
    stored_state = request.session.get('oauth_state')
    print(f"Received state: {received_state}")
    print(f"Stored state: {stored_state}")
    
    if not received_state:
        return Response({'error': 'No state parameter received'}, status=400)
    
    if not stored_state:
        return Response({
            'error': 'No state found in session',
            'details': 'Session may have expired or cookies may not be properly set'
        }, status=400)
    
    if received_state != stored_state:
        return Response({'error': f'State mismatch. Received: {received_state}, Stored: {stored_state}'}, status=400)
    
    # Get user from session
    user_id = request.session.get('oauth_user_id')
    if not user_id:
        return Response({'error': 'No user found in session'}, status=400)
    
    try:
        user = User.objects.get(id=user_id)
        request.user = user
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=400)

    callback_uri = request.build_absolute_uri(reverse('google-oauth-callback'))
    flow = create_oauth_flow(callback_uri, state=received_state)
    
    # Fetch the authorization code
    code = request.query_params.get('code')
    flow.fetch_token(code=code)
    
    credentials = flow.credentials
    credentials_dict = credentials_to_dict(credentials)
    
    # Store credentials in user profile
    profile = request.user.profile
    profile.google_drive_credentials = credentials_dict
    
    # Create CTS root folder
    drive_service = get_google_drive_service(credentials_dict)
    folder_id = create_cts_root_folder(drive_service)
    profile.google_drive_folder_id = folder_id
    profile.save()
    
    # Clean up session
    if 'oauth_state' in request.session:
        del request.session['oauth_state']
    if 'oauth_user_id' in request.session:
        del request.session['oauth_user_id']
    
    # Redirect to frontend with success status
    frontend_url = settings.FRONTEND_URL
    return redirect(f"{frontend_url}/files?status=success")