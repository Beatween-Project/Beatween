package com.a205.beatween.domain.play.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ManagerChangedMessage {
    private String sessionId;
    private String userId;
}
