package com.a205.beatween.domain.space.dto;

import com.a205.beatween.domain.song.dto.CopySongListByCategoryDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SpaceDetailDto {
    SpaceDetailResponseDto spaceDetailResponseDto;
    List<CopySongListByCategoryDto> songList;

}
