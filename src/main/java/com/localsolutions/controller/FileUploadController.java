package com.localsolutions.controller;

import com.localsolutions.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/post-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadPostImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileUploadService.uploadFile(file, "posts");
            String fileUrl = fileUploadService.getFileUrl(fileName);

            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", fileUrl);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to upload file");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/post-image/{fileName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deletePostImage(@PathVariable String fileName) {
        try {
            fileUploadService.deleteFile(fileName);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete file");
            return ResponseEntity.badRequest().body(response);
        }
    }
} 