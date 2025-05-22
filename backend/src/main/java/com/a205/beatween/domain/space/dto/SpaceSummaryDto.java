package com.a205.beatween.domain.space.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpaceSummaryDto {
    String spaceName;
    int spaceId;
}
