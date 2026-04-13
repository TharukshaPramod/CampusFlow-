package com.sliit.campusflow.config;

import com.sliit.campusflow.modules.auth.security.JwtAuthenticationFilter;
import com.sliit.campusflow.modules.auth.security.OAuth2AuthenticationSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Slf4j
public class SecurityConfig {

    private static final String[] PUBLIC_ENDPOINTS = new String[]{
        "/actuator/health",
        "/actuator/info",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/ws/**",
        "/api/public/**",
        "/api/v1/resources/**",
        "/api/v1/resource-types/**",
        "/api/auth/**",
        "/oauth2/**",
        "/login/oauth2/**"
    };

    @Value("${app.jwt.issuer:campusflow}")
    private String jwtIssuer;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired(required = false)
    private JwtAuthenticationFilter jwtFilter;
    
    @Autowired(required = false)
    private OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;

    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource) {
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        AuthenticationEntryPoint apiAuthEntryPoint = (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Unauthorized\"}");
        };

        RequestMatcher apiRequestMatcher = request -> request.getRequestURI() != null
            && request.getRequestURI().startsWith("/api/");

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)
            // OAuth2 authorization flow requires temporary state between redirects.
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(apiAuthEntryPoint, apiRequestMatcher)
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    if (request.getRequestURI().startsWith("/api/")) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"message\":\"Forbidden\"}");
                        return;
                    }
                    response.sendError(HttpServletResponse.SC_FORBIDDEN);
                })
            );

        // Add OAuth2 login configuration
        if (oauth2SuccessHandler != null) {
            log.info("Configuring OAuth2 login with redirect to frontend: {}", frontendUrl);
            http.oauth2Login(oauth2 -> oauth2
                .successHandler(oauth2SuccessHandler)
                .failureHandler((request, response, exception) -> {
                    log.error("OAuth2 authentication FAILED: {}", exception.getMessage(), exception);
                    response.sendRedirect(frontendUrl + "/login?error=oauth2_failed");
                }));
        } else {
            log.warn("OAuth2SuccessHandler is NULL - OAuth2 login will not be configured!");
        }

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        if (jwtFilter != null) {
            http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }
}