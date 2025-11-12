import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from django.conf import settings

# ✅ Read credentials directly from environment
GOOGLE_OAUTH2_CLIENT_ID = os.getenv("GOOGLE_OAUTH2_CLIENT_ID")
GOOGLE_OAUTH2_CLIENT_SECRET = os.getenv("GOOGLE_OAUTH2_CLIENT_SECRET")
GOOGLE_OAUTH2_SCOPES = os.getenv("GOOGLE_OAUTH2_SCOPES", "https://www.googleapis.com/auth/drive").split(",")

def create_oauth_flow(redirect_uri, state=None):
    """Create OAuth 2.0 flow instance to manage the OAuth 2.0 Authorization Grant Flow."""
    if not GOOGLE_OAUTH2_CLIENT_ID or not GOOGLE_OAUTH2_CLIENT_SECRET:
        raise EnvironmentError("Google OAuth2 credentials not found in environment variables.")

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_OAUTH2_CLIENT_ID,
                "client_secret": GOOGLE_OAUTH2_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=GOOGLE_OAUTH2_SCOPES,
        redirect_uri=redirect_uri,
        state=state
    )
    return flow


def credentials_from_dict(credentials_dict):
    """Create OAuth 2.0 credentials from dictionary."""
    if not credentials_dict:
        return None
    return Credentials(
        token=credentials_dict.get('token'),
        refresh_token=credentials_dict.get('refresh_token'),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_OAUTH2_CLIENT_ID,
        client_secret=GOOGLE_OAUTH2_CLIENT_SECRET,
        scopes=credentials_dict.get('scopes'),
    )


def credentials_to_dict(credentials):
    """Convert OAuth 2.0 credentials to dictionary for storage."""
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'scopes': credentials.scopes,
    }


def get_google_drive_service(credentials_dict):
    """Build and return Google Drive API service using stored credentials."""
    credentials = credentials_from_dict(credentials_dict)
    if not credentials:
        return None
    return build('drive', 'v3', credentials=credentials)


def create_cts_root_folder(service):
    """Create CTS root folder in user's Google Drive if it doesn't exist."""
    # Search for existing CTS folder
    results = service.files().list(
        q="name='CTS' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        spaces='drive',
        fields='files(id, name)'
    ).execute()

    existing_folders = results.get('files', [])

    if existing_folders:
        # Return existing folder ID
        return existing_folders[0]['id']

    # Create new CTS folder
    folder_metadata = {
        'name': 'CTS',
        'mimeType': 'application/vnd.google-apps.folder'
    }
    folder = service.files().create(
        body=folder_metadata,
        fields='id'
    ).execute()

    return folder.get('id')
