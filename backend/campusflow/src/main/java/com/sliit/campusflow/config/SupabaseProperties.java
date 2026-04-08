package com.sliit.campusflow.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseProperties {
    private String apiUrl;
    private String anonKey;
    private String serviceRoleKey;
    private String jwksUrl;
}