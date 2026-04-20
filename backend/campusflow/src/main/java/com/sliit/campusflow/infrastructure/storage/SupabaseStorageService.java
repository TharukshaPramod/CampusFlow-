package com.sliit.campusflow.infrastructure.storage;

import com.sliit.campusflow.config.SupabaseProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageService {

    private final SupabaseProperties supabaseProperties;

    /**
     * Uploads a base64 encoded image string to the specified Supabase bucket.
     *
     * @param base64Data The base64 file data (can optionally contain "data:image/jpeg;base64," prefix).
     * @param bucketName The name of the target Supabase Storage bucket.
     * @return The public URL string of the uploaded file.
     */
    public String uploadBase64Image(String base64Data, String bucketName) {
        if (base64Data == null || base64Data.trim().isEmpty()) {
            return null;
        }

        // Determine content type and exact base64 payload
        String contentType = "image/jpeg";
        String payload = base64Data;
        
        if (base64Data.startsWith("data:")) {
            int commaIndex = base64Data.indexOf(',');
            if (commaIndex > 0) {
                // e.g., "data:image/png;base64" -> "image/png"
                String metaData = base64Data.substring(5, commaIndex);
                if (metaData.contains(";")) {
                    contentType = metaData.substring(0, metaData.indexOf(';'));
                }
                payload = base64Data.substring(commaIndex + 1);
            }
        }

        // Decode string to bytes
        byte[] imageBytes;
        try {
            imageBytes = Base64.getDecoder().decode(payload);
        } catch (IllegalArgumentException e) {
             throw new RuntimeException("Invalid Base64 Image string provided.");
        }

        // Generate a random file name to ensure uniqueness
        String fileExtension = getExtensionFromContentType(contentType);
        String fileName = UUID.randomUUID() + "." + fileExtension;

        String apiUrl = supabaseProperties.getApiUrl();
        if (apiUrl == null || apiUrl.isBlank()) {
            throw new IllegalStateException("Supabase API URL is not configured.");
        }

        String serviceRoleKey = supabaseProperties.getServiceRoleKey();
        String anonKey = supabaseProperties.getAnonKey();
        String authToken = (serviceRoleKey != null && !serviceRoleKey.isBlank()) ? serviceRoleKey : anonKey;
        if (authToken == null || authToken.isBlank()) {
            throw new IllegalStateException("Supabase auth token is not configured. Provide service-role-key or anon-key.");
        }
        
        // Supabase REST endpoint: https://[project-ref].supabase.co/storage/v1/object/bucketName/fileName
        String uploadUrl = apiUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        // Use the service role key to forcefully bypass Row Level Security policies for uploading if needed, or Anon key
        headers.setBearerAuth(authToken);
        headers.set("Content-Type", contentType);

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(imageBytes, headers);

        log.info("Uploading image to Supabase Bucket '{}' with name '{}'", bucketName, fileName);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    Objects.requireNonNull(HttpMethod.POST),
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                // Returns the public URL 
                return apiUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
            } else {
                throw new RuntimeException("Failed to upload image. Status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Exception during Supabase Storage upload: ", e);
            throw new RuntimeException("Error uploading image to Supabase: " + e.getMessage());
        }
    }

    private String getExtensionFromContentType(String contentType) {
        if (contentType == null) return "bin";
        switch (contentType.toLowerCase()) {
            case "image/png": return "png";
            case "image/gif": return "gif";
            case "image/webp": return "webp";
            case "image/jpeg":
            case "image/jpg": 
                return "jpg";
            case "image/svg+xml": return "svg";
            default: return "bin";
        }
    }
}
