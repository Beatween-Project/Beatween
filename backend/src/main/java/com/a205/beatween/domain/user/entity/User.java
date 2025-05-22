package com.a205.beatween.domain.user.entity;

import com.a205.beatween.domain.user.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "nickname", nullable = false, length = 20)
    private String nickname;

    @Column(name = "password", nullable = false, length =100)
    private String password;

    @Column(name = "profile_image_url", nullable = true, length = 255)
    private String profileImageUrl;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false,
            columnDefinition = "ENUM('ACTIVE','DELETED') default 'ACTIVE'")
    private UserStatus userStatus = UserStatus.ACTIVE;

    @Column(name = "social_login_id", nullable = true, length = 100)
    private String socialLoginId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
