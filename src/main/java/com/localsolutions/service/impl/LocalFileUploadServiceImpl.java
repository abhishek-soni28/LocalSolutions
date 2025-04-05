package com.localsolutions.service.impl;

import com.localsolutions.service.FileUploadService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalFileUploadServiceImpl implements FileUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.base-url}")
    private String baseUrl;

    @Override
    public String uploadFile(MultipartFile file, String directory) throws IOException {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + fileExtension;

        Path uploadPath = Paths.get(uploadDir, directory).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        Path targetLocation = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return newFilename;
    }

    @Override
    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl != null && !fileUrl.isEmpty()) {
            Path filePath = Paths.get(uploadDir, fileUrl).toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
        }
    }

    @Override
    public String getFileUrl(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return null;
        }
        return baseUrl + "/uploads/" + fileName;
    }
} 