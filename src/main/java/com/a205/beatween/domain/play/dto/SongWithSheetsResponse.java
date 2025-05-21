package com.a205.beatween.domain.play.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class SongWithSheetsResponse {
    private Integer copySongId;
    private String title;
    private List<SheetInfoResponse> sheets;
}