package com.a205.beatween.domain.play.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class CategoryWithSongsResponse {
    private Integer categoryId;
    private String categoryName;
    private List<SongWithSheetsResponse> songs;
}
