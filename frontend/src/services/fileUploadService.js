import { upload } from './api';

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await upload.uploadImage(file);
    
    if (!response.data || (!response.data.url && !response.data.fileUrl)) {
      throw new Error('Invalid response from server');
    }

    return {
      data: {
        fileUrl: response.data.url || response.data.fileUrl,
        fileName: response.data.fileName
      }
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to upload image');
    }
  }
};

export const deleteImage = async (fileName) => {
  try {
    await upload.deletePostImage(fileName);
  } catch (error) {
    console.error('Error deleting image:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to delete image');
    }
  }
}; 