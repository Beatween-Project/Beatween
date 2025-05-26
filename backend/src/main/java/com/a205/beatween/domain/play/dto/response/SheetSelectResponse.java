package com.a205.beatween.domain.play.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SheetSelectResponse {
    private int copySheetId;
    private String instrumentPart;
    private String sheetUrl;
}
