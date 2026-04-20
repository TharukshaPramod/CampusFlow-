package com.sliit.campusflow.modules.auth.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMyProfileRequest {
    private String name;
    private String picture;
}