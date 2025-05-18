import { upload } from './api';

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await upload.uploadImage(file);

    if (!response.data || (!response.data.fileUrl && !response.data.fileName)) {
      throw new Error('Invalid response from server');
    }

    return {
      fileUrl: response.data.fileUrl,
      fileName: response.data.fileName
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to upload image');
    }
  }
};

export const uploadProfileImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await upload.uploadProfileImage(file);

    if (!response.data || (!response.data.fileUrl && !response.data.fileName)) {
      throw new Error('Invalid response from server');
    }

    return {
      fileUrl: response.data.fileUrl,
      fileName: response.data.fileName
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to upload profile image');
    }
  }
};

export const deleteImage = async (fileName) => {
  try {
    await upload.deleteFile(fileName);
  } catch (error) {
    console.error('Error deleting image:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to delete image');
    }
  }
};