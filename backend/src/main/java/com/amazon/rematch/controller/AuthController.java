package com.amazon.rematch.controller;

import com.amazon.rematch.dto.AuthResponse;
import com.amazon.rematch.dto.LoginRequest;
import com.amazon.rematch.dto.RegisterRequest;
import com.amazon.rematch.dto.UpdateProfileRequest;
import com.amazon.rematch.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthResponse> profile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.profile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), req));
    }
}
