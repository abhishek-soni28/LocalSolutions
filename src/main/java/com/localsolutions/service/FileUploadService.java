package com.localsolutions.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface FileUploadService {
    String uploadFile(MultipartFile file, String directory) throws IOException;
    void deleteFile(String fileUrl) throws IOException;
    String getFileUrl(String fileName);
} 