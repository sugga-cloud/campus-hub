from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import os

def get_drive_service(user):
    """
    Returns an authenticated Google Drive service object for the given user.
    (Assumes you have stored their OAuth credentials)
    """
    # You need to have user's Google credentials stored securely (OAuth tokens)
    token_path = f"tokens/{user.username}_token.json"
    if not os.path.exists(token_path):
        raise Exception("User has not linked their Google Drive account yet.")

    creds = Credentials.from_authorized_user_file(token_path, ['https://www.googleapis.com/auth/drive'])
    service = build('drive', 'v3', credentials=creds)
    return service


def upload_to_drive(service, file_path, file_name, mime_type, parent_drive_id=None):
    """
    Upload a file to Google Drive and return file metadata.
    """
    file_metadata = {'name': file_name}
    if parent_drive_id:
        file_metadata['parents'] = [parent_drive_id]

    media = MediaFileUpload(file_path, mimetype=mime_type)
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id, name, webViewLink, mimeType, size'
    ).execute()

    return file
