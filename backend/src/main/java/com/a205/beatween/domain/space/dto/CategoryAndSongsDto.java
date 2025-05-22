package com.a205.beatween.domain.space.dto;

import com.a205.beatween.domain.song.dto.CopySongDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryAndSongsDto {
    private Integer categoryId;
    private String name;
    private List<CopySongDto> songs;
}
