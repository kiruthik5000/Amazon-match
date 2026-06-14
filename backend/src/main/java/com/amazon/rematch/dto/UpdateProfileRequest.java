package com.amazon.rematch.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String phone;
    private String city;
    private String state;
    private String country;
    private Double latitude;
    private Double longitude;
}
