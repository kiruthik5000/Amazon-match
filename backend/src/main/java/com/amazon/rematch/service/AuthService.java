package com.amazon.rematch.service;

import com.amazon.rematch.dto.AuthResponse;
import com.amazon.rematch.dto.LoginRequest;
import com.amazon.rematch.dto.RegisterRequest;
import com.amazon.rematch.dto.UpdateProfileRequest;
import com.amazon.rematch.entity.User;
import com.amazon.rematch.repository.UserRepository;
import com.amazon.rematch.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .city(req.getCity())
                .state(req.getState())
                .country(req.getCountry())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return toResponse(user, token);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String token = jwtUtil.generateToken(user.getEmail());
        return toResponse(user, token);
    }

    public AuthResponse profile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toResponse(user, null);
    }

    public AuthResponse updateProfile(String email, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (req.getPhone()   != null) user.setPhone(req.getPhone());
        if (req.getCity()    != null) user.setCity(req.getCity());
        if (req.getState()   != null) user.setState(req.getState());
        if (req.getCountry() != null) user.setCountry(req.getCountry());
        if (req.getLatitude()  != null) user.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) user.setLongitude(req.getLongitude());
        userRepository.save(user);
        return toResponse(user, null);
    }

    private AuthResponse toResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .role(user.getRole().name())
                .build();
    }
}
