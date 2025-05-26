package com.a205.beatween.domain.play.dto.response;

import com.a205.beatween.domain.drawing.dto.DrawingPoint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class SheetWithDrawingResponse {
    private Integer copySheetId;
    private String part;
    private String sheetUrl;
    private List<DrawingPoint> drawings;
}