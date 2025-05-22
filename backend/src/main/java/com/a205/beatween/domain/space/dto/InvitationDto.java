package com.a205.beatween.domain.space.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InvitationDto {
    private int spaceId;
    private boolean isMember;
}
