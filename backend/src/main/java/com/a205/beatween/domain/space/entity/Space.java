package com.a205.beatween.domain.space.entity;

import com.a205.beatween.domain.space.enums.SpaceType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "spaces")
public class Space {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "space_id", nullable = false)
    private Integer spaceId;

    @Column(length = 50)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "share_key", length = 255)
    private String shareKey;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false,
            columnDefinition = "ENUM('PERSONAL','TEAM') default 'PERSONAL'")
    private SpaceType spaceType = SpaceType.PERSONAL;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
