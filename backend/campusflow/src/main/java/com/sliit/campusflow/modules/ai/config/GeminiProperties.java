package com.sliit.campusflow.modules.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "gemini")
public class GeminiProperties {
    private String apiKey;
    private String model = "gemini-2.5-flash";
    private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";
}
