package com.a205.beatween.domain.drawing.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrawingPoint {
    private double relativeX;
    private double relativeY;
    private String color;

    public static DrawingPoint from(DrawingUpdateMessage msg) {
        return DrawingPoint.builder()
                .relativeX(msg.getRelativeX())
                .relativeY(msg.getRelativeY())
                .color(msg.getColor())
                .build();
    }

}
