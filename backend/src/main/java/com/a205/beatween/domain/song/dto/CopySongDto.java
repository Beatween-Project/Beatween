package com.a205.beatween.domain.song.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CopySongDto {

    @JsonProperty("song_id")
    private Integer songId;

    @JsonProperty("category_id")
    private Integer categoryId;

    private String title;

    @JsonProperty("thumbnail_url")
    private String thumbnailUrl;
}
