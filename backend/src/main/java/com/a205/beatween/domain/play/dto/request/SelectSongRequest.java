package com.a205.beatween.domain.play.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelectSongRequest {
    private Integer copySongId;
}