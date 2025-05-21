package com.a205.beatween.domain.play.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelectSongRequest {
    private Integer copySongId;
    private Integer userId;
}

