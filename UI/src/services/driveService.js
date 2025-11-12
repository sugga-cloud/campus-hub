import axios from '../axios/axios';

export const driveService = {
    // Download file
    downloadFile: async (fileId) => {
        try {
            const response = await axios.get(`/files/drive/${fileId}/download`, {
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            throw new Error('Failed to download file');
        }
    },
    // Initialize Google OAuth flow
    initiateGoogleAuth: async () => {
        try {
            const response = await axios.get('/user/google/auth');
            // Redirect to Google's consent screen
            window.location.href = response.data.authorization_url;
        } catch (error) {
            throw new Error('Failed to initiate Google authentication');
        }
    },

    // List files in the CTS root folder
    listFiles: async (folderId = null) => {
        try {
            const params = folderId ? { folder_id: folderId } : {};
            const response = await axios.get('/files/drive/list', { params });
            console.log('Drive API Response:', response.data); // Debug info
            return {
                files: response.data.files || response.data, // Handle both new and old response format
                debug_info: response.data.debug_info
            };
        } catch (error) {
            console.error('Error listing files:', error.response || error); // Debug info
            throw new Error(error.response?.data?.error || 'Failed to list files');
        }
    },

    // Upload file to Drive
    uploadFile: async (file, parentFolderId = null) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Always send the parent_id parameter, even if null
            formData.append('parent_id', parentFolderId || '');

            console.log('Uploading file to folder:', parentFolderId); // Debug info

            const response = await axios.post('/files/drive/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log('Upload response:', response.data); // Debug info
            return response.data;
        } catch (error) {
            console.error('Upload error:', error.response || error); // Debug info
            throw new Error(error.response?.data?.error || 'Failed to upload file');
        }
    },

    // Create new folder
    createFolder: async (name, parentFolderId = null) => {
        try {
            console.log('Creating folder in:', parentFolderId); // Debug info
            
            const response = await axios.post('/files/drive/folder', {
                name,
                parent_id: parentFolderId || ''  // Always send parent_id, even if empty
            });

            console.log('Create folder response:', response.data); // Debug info
            return response.data;
        } catch (error) {
            console.error('Create folder error:', error.response || error); // Debug info
            throw new Error(error.response?.data?.error || 'Failed to create folder');
        }
    },

    // Move/Copy file
    moveFile: async (fileId, destinationFolderId, operation = 'move') => {
        try {
            const response = await axios.post('/files/drive/move', {
                file_id: fileId,
                destination_folder_id: destinationFolderId,
                operation
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to ${operation} file`);
        }
    },

    // Rename file/folder
    rename: async (fileId, newName) => {
        try {
            const response = await axios.patch(`/files/drive/${fileId}/rename/`, {
                new_name: newName
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to rename item');
        }
    },

    // Delete file/folder
    delete: async (fileId) => {
        try {
            await axios.delete(`/files/drive/${fileId}`);
        } catch (error) {
            throw new Error('Failed to delete item');
        }
    }
};