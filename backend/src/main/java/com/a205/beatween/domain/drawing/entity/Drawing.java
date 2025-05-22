package com.a205.beatween.domain.drawing.entity;

import com.a205.beatween.domain.song.entity.CopySheet;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "drawings")
public class Drawing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drawing_id", nullable = false)
    private Integer drawingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "copy_sheet_id", nullable = false)
    private CopySheet copySheet;

    @Column(name = "x", nullable = false)
    private double x;

    @Column(name = "y", nullable = false)
    private double y;

    @Column(name = "color", nullable = false)
    private String color;
}
