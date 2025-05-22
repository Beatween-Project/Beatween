package com.a205.beatween.domain.space.entity;

import com.a205.beatween.domain.space.enums.RoleType;
import com.a205.beatween.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users_spaces")
public class UserSpace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_space_id", nullable = false)
    private Integer userSpaceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private Space space;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false,
            columnDefinition = "ENUM('OWNER','MEMBER') default 'OWNER'")
    private RoleType roleType = RoleType.OWNER;
}
