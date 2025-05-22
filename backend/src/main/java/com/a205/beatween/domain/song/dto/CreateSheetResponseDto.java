package com.a205.beatween.domain.song.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateSheetResponseDto {

    private String title;

    @JsonProperty("youtube_url")
    private String youtubeUrl;

    @JsonProperty("thumbnail_url")
    private String thumbnailUrl;

    private Short bpm;

    @JsonProperty("total_measures")
    private Short totalMeasures;

    @JsonProperty("vocal_url")
    private String vocalUrl;

    @JsonProperty("guitar_url")
    private String guitarUrl;

    @JsonProperty("bass_url")
    private String bassUrl;

    @JsonProperty("drum_url")
    private String drumUrl;
}
