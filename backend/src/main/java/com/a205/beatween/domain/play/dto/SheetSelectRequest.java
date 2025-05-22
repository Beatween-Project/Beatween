package com.a205.beatween.domain.play.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SheetSelectRequest {
    private int spaceId;
    private int copySongId;
    private String instrumentPart;
}