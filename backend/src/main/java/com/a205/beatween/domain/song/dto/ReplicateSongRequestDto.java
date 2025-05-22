package com.a205.beatween.domain.song.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReplicateSongRequestDto {

    @JsonProperty("dest_space_id")
    private Integer destSpaceId;

    @JsonProperty("category_id")
    private Integer categoryId;
}
