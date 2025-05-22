package com.a205.beatween.domain.user.dto;

import com.a205.beatween.domain.space.dto.CategoryAndSongsDto;
import com.a205.beatween.domain.space.dto.SpacePreDto;
import com.a205.beatween.domain.space.entity.Space;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoDto {
    private String name;
    private String profileImageUrl;
    private List<SpacePreDto> spaces;
    private List<CategoryAndSongsDto> categoriesAndSongsOfMySpace;
}
