from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.core.exceptions import ValidationError

from .utils.drive_operations import (
    get_drive_service,
    list_files,
    create_folder,
    upload_file,
    move_file,
    copy_file,
    rename_file,
    delete_file,
    make_file_shareable
)

from .models import ShareLink
from django.http import JsonResponse

@api_view(['GET'])
def total_shared_files(request):
    """
    Returns the total number of active, non-expired shared files across all users.
    """
    # Fetch all active share links
    shared_links = ShareLink.objects.all()
    print()
    # Exclude expired ones
    active_links = [link for link in shared_links if not link.is_expired]

    return JsonResponse({
        "total_shared_files": len(shared_links),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_drive_files(request):
    """List files from user's Google Drive CTS folder."""
    try:
        user_profile = request.user.profile
        if not user_profile.google_drive_credentials:
            return Response(
                {"error": "Google Drive not connected"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        folder_id = request.query_params.get('folder_id', user_profile.google_drive_folder_id)
        print(f"Listing files for folder_id: {folder_id}")  # Debug info
        print(f"User's root folder_id: {user_profile.google_drive_folder_id}")  # Debug info
        service = get_drive_service(user_profile.google_drive_credentials)
        
        try:
            # Verify the folder exists and user has access
            if folder_id:
                folder = service.files().get(fileId=folder_id, fields="id, name").execute()
                print(f"Current folder: {folder.get('name', 'Unknown')} ({folder_id})")  # Debug info
        except Exception as e:
            print(f"Error accessing folder: {str(e)}")  # Debug info
            # If folder not found or inaccessible, fall back to root folder
            folder_id = user_profile.google_drive_folder_id
        
        files = list_files(service, folder_id)
        
        # Add debug info to response
        response_data = {
            "files": files,
            "debug_info": {
                "total_files": len(files),
                "current_folder_id": folder_id,
                "root_folder_id": user_profile.google_drive_folder_id
            }
        }
        
        return Response(response_data)
    except Exception as e:
        print(f"Error in list_drive_files: {str(e)}")  # Debug info
        return Response(
            {
                "error": str(e),
                "debug_info": {
                    "user_id": request.user.id,
                    "has_credentials": bool(user_profile.google_drive_credentials),
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_to_drive(request):
    """Upload a file to Google Drive."""
    try:
        user_profile = request.user.profile
        if not user_profile.google_drive_credentials:
            return Response(
                {"error": "Google Drive not connected"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if 'file' not in request.FILES:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        file_obj = request.FILES['file']
        # Use current folder ID from request, fallback to CTS root folder
        parent_id = request.data.get('parent_id')
        if not parent_id:
            parent_id = user_profile.google_drive_folder_id
        
        service = get_drive_service(user_profile.google_drive_credentials)
        
        # Verify parent folder exists and is accessible
        try:
            service.files().get(fileId=parent_id, fields="id, name").execute()
        except Exception as e:
            print(f"Error verifying parent folder: {str(e)}")
            # Fallback to CTS root folder if specified folder is inaccessible
            parent_id = user_profile.google_drive_folder_id
        
        file_id = upload_file(service, file_obj, file_obj.name, parent_id)
        
        return Response({
            "file_id": file_id,
            "parent_id": parent_id  # Return the actual parent ID used
        })
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_drive_folder(request):
    """Create a new folder in Google Drive."""
    try:
        user_profile = request.user.profile
        if not user_profile.google_drive_credentials:
            return Response(
                {"error": "Google Drive not connected"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        name = request.data.get('name')
        if not name:
            return Response(
                {"error": "Folder name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Use current folder ID from request, fallback to CTS root folder
        parent_id = request.data.get('parent_id')
        if not parent_id:
            parent_id = user_profile.google_drive_folder_id
            
        service = get_drive_service(user_profile.google_drive_credentials)
        
        # Verify parent folder exists and is accessible
        try:
            parent_folder = service.files().get(
                fileId=parent_id, 
                fields="id, name"
            ).execute()
            print(f"Creating folder '{name}' in {parent_folder.get('name')} ({parent_id})")
        except Exception as e:
            print(f"Error verifying parent folder: {str(e)}")
            # Fallback to CTS root folder if specified folder is inaccessible
            parent_id = user_profile.google_drive_folder_id
        
        folder_id = create_folder(service, name, parent_id)
        
        return Response({
            "folder_id": folder_id,
            "parent_id": parent_id,  # Return the actual parent ID used
            "name": name
        })
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def move_drive_file(request):
    """Move a file to a different folder."""
    try:
        user_profile = request.user.profile
        if not user_profile.google_drive_credentials:
            return Response(
                {"error": "Google Drive not connected"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        file_id = request.data.get('file_id')
        destination_id = request.data.get('destination_id')
        operation = request.data.get('operation', 'move')  # 'move' or 'copy'

        if not file_id or not destination_id:
            return Response(
                {"error": "File ID and destination folder ID are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = get_drive_service(user_profile.google_drive_credentials)
        
        if operation == 'copy':
            result = copy_file(service, file_id, destination_id)
        else:
            result = move_file(service, file_id, destination_id)
        
        return Response(result)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def rename_drive_file(request, file_id):
    """Rename a file or folder."""
    try:
        user_profile = request.user.profile
        if not user_profile.google_drive_credentials:
            return Response(
                {"error": "Google Drive not connected"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        new_name = request.data.get('new_name')
        if not new_name:
            return Response(
                {"error": "New name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = get_drive_service(user_profile.google_drive_credentials)
        result = rename_file(service, file_id, new_name)
        
        return Response(result)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_drive_file(request, file_id):
    """Delete a file or folder."""
    try:
        user_profile = request.user.profile
        if not user_profile.google_drive_credentials:
            return Response(
                {"error": "Google Drive not connected"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        service = get_drive_service(user_profile.google_drive_credentials)
        delete_file(service, file_id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_drive_file(request, file_id):
    """Download a file from Google Drive."""
    try:
        user_profile = request.user.profile
        if not user_profile.google_drive_credentials:
            return Response(
                {"error": "Google Drive not connected"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        service = get_drive_service(user_profile.google_drive_credentials)
        
        # Get file metadata first
        file = service.files().get(fileId=file_id, fields='name, mimeType').execute()
        
        # Download file content
        request = service.files().get_media(fileId=file_id)
        file_content = request.execute()
        
        # Create response with proper content type and filename
        response = HttpResponse(
            file_content,
            content_type=file.get('mimeType', 'application/octet-stream')
        )
        response['Content-Disposition'] = f'attachment; filename="{file["name"]}"'
        
        return response
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def share_drive_file(request, file_id):
    """
    Make a Google Drive file shareable (viewable and downloadable).

    Returns public view and download links.
    """
    try:
        user_profile = request.user.profile

        if not user_profile.google_drive_credentials:
            return Response(
                {"error": "Google Drive not connected"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Create Drive service
        service = get_drive_service(user_profile.google_drive_credentials)

        # Call the share function
        links = make_file_shareable(service, file_id,user=request.user, anyone=True)

        if not links:
            return Response(
                {"error": "Failed to make file shareable"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                "message": "File is now shareable",
                "view_link": links["view_link"],
                "download_link": links["download_link"]
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )