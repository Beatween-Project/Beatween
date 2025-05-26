package com.a205.beatween.domain.play.dto.message;

import com.a205.beatween.domain.play.enums.PlayStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayControlMessage {
    private Integer spaceId;
    private int bpm;
    private long startTimestamp; // 시작 시각
    private PlayStatus playStatus;
    private int currentMeasure; //현재 마디
    private double positionInMeasure; // 마디에서의 경과 시간

    @JsonIgnore
    private Integer sender; // userId
}
