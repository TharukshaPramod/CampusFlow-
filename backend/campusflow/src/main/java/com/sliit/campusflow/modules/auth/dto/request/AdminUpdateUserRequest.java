package com.sliit.campusflow.modules.auth.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateUserRequest {
    private String name;
    private String email;
    private String password;
}
