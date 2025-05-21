package com.a205.beatween.domain.user.dto;

import com.a205.beatween.domain.space.dto.CategoryAndSongsDto;
import com.a205.beatween.domain.space.dto.SpacePreDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignupDto {
    private String email;
    private String nickname;
    private String password;
}
