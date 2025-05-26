package com.a205.beatween.domain.play.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SheetInfoResponse {
    private Integer copySheetId;
    private String part;
    private String sheetUrl;
}