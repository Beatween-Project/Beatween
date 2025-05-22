package com.a205.beatween.domain.space.dto;

import com.a205.beatween.domain.space.enums.RoleType;
import com.a205.beatween.domain.space.enums.SpaceType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SpaceDetailResponseDto {
    private Integer spaceId;
    private String spaceName;
    private String description;
    private String imageUrl;
    private SpaceType spaceType;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
    private RoleType roleType;
    private List<MemberDto> members;
}
