import os
import sys
from io import BytesIO
import mimetypes
import django
import requests
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from dotenv import load_dotenv
from file.models import ShareLink, DriveNode

# Load environment variables from .env file
load_dotenv()

# Optional: setup Django if this is run standalone (e.g., as a script)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project_name.settings')
django.setup()


def get_drive_service(credentials_dict):
    """Get a Google Drive service instance from credentials."""

    GOOGLE_OAUTH2_CLIENT_ID = os.getenv("GOOGLE_OAUTH2_CLIENT_ID")
    GOOGLE_OAUTH2_CLIENT_SECRET = os.getenv("GOOGLE_OAUTH2_CLIENT_SECRET")

    if not GOOGLE_OAUTH2_CLIENT_ID or not GOOGLE_OAUTH2_CLIENT_SECRET:
        raise ValueError("Google OAuth client ID/secret not set in environment variables.")

    credentials = Credentials(
        token=credentials_dict.get("token"),
        refresh_token=credentials_dict.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_OAUTH2_CLIENT_ID,
        client_secret=GOOGLE_OAUTH2_CLIENT_SECRET,
        scopes=credentials_dict.get("scopes", []),
    )

    # Refresh if expired or invalid
    if not credentials.valid and credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())

    return build('drive', 'v3', credentials=credentials)


def list_files(service, folder_id=None, page_size=100):
    """List files in a specific folder or root."""
    try:
        query_parts = ["trashed = false"]
        if folder_id:
            query_parts.append(f"'{folder_id}' in parents")
        query = " and ".join(query_parts)

        results = service.files().list(
            q=query,
            pageSize=page_size,
            fields="files(id, name, mimeType, size, modifiedTime, parents, webViewLink, iconLink, thumbnailLink)",
            orderBy="folder,name"
        ).execute()

        return results.get('files', [])
    except Exception as e:
        raise Exception(f"Failed to list files: {str(e)}")


def create_folder(service, name, parent_id=None):
    """Create a new folder in Google Drive."""
    file_metadata = {'name': name, 'mimeType': 'application/vnd.google-apps.folder'}
    if parent_id:
        file_metadata['parents'] = [parent_id]

    try:
        folder = service.files().create(body=file_metadata, fields='id').execute()
        return folder.get('id')
    except Exception as e:
        raise Exception(f"Failed to create folder: {str(e)}")


def upload_file(service, file_obj, filename, parent_id=None):
    """Upload a file to Google Drive."""
    mime_type, _ = mimetypes.guess_type(filename)
    mime_type = mime_type or 'application/octet-stream'

    file_metadata = {'name': filename}
    if parent_id:
        file_metadata['parents'] = [parent_id]

    try:
        media = MediaIoBaseUpload(BytesIO(file_obj.read()), mimetype=mime_type, resumable=True)
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        return file.get('id')
    except Exception as e:
        raise Exception(f"Failed to upload file: {str(e)}")


def move_file(service, file_id, new_parent_id):
    """Move a file to a different folder."""
    try:
        file = service.files().get(fileId=file_id, fields='parents').execute()
        previous_parents = ",".join(file.get('parents', []))
        updated = service.files().update(
            fileId=file_id,
            addParents=new_parent_id,
            removeParents=previous_parents,
            fields='id, parents'
        ).execute()
        return updated
    except Exception as e:
        raise Exception(f"Failed to move file: {str(e)}")


def copy_file(service, file_id, new_parent_id=None):
    """Create a copy of a file."""
    try:
        body = {'parents': [new_parent_id]} if new_parent_id else {}
        file = service.files().copy(fileId=file_id, body=body).execute()
        return file
    except Exception as e:
        raise Exception(f"Failed to copy file: {str(e)}")


def rename_file(service, file_id, new_name):
    """Rename a file or folder."""
    try:
        file = service.files().update(fileId=file_id, body={'name': new_name}, fields='id, name').execute()
        return file
    except Exception as e:
        raise Exception(f"Failed to rename file: {str(e)}")


def delete_file(service, file_id):
    """Delete a file or folder."""
    try:
        service.files().delete(fileId=file_id).execute()
        return True
    except Exception as e:
        raise Exception(f"Failed to delete file: {str(e)}")


def make_file_shareable(service, file_id, user=None, anyone=True, email=None, role="reader"):
    """Make a Google Drive file shareable and record in DB."""
    if not anyone and not email:
        raise ValueError("You must specify either anyone=True or provide an email.")

    permission = {"type": "anyone" if anyone else "user", "role": role}
    if email:
        permission["emailAddress"] = email

    try:
        service.permissions().create(fileId=file_id, body=permission, fields="id").execute()
        file = service.files().get(fileId=file_id, fields="webViewLink, webContentLink").execute()

        view_link = file.get("webViewLink")
        download_link = file.get("webContentLink")

        try:
            ShareLink.objects.create(
                file_id=file_id,
                created_by=user,
            )
        except DriveNode.DoesNotExist:
            print("⚠️ No matching DriveNode found for this file ID, skipping DB link creation.")

        return {"view_link": view_link, "download_link": download_link}
    except Exception as e:
        print(f"❌ Error making file shareable: {e}")
        return None
