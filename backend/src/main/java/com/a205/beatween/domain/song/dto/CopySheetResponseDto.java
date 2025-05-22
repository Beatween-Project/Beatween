package com.a205.beatween.domain.song.dto;

import com.a205.beatween.domain.song.entity.CopySheet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CopySheetResponseDto {
    private Integer copySheetId;
    private Integer copySongId;
    private String part;
    private String sheetUrl;

    public static CopySheetResponseDto from(CopySheet sheet){
        return CopySheetResponseDto.builder()
                .copySheetId(sheet.getCopySheetId())
                .copySongId(sheet.getCopySong().getCopySongId())
                .part(sheet.getPart())
                .sheetUrl(sheet.getSheetUrl())
                .build();
    }
}
