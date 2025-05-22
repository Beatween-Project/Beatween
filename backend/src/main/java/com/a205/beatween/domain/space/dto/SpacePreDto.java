package com.a205.beatween.domain.space.dto;

import com.a205.beatween.domain.space.enums.SpaceType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SpacePreDto {

    @JsonProperty("space_id")
    private Integer spaceId;

    @JsonProperty("space_name")
    private String spaceName;

    @JsonProperty("img_url")
    private String imgUrl;

    @JsonProperty("space_type")
    @Enumerated(EnumType.STRING)
    private SpaceType spaceType;
}
