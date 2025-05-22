package com.a205.beatween.domain.song.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UrlRequestDto {

    @JsonProperty("youtube_url")
    private String youtubeUrl;
}
