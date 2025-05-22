package com.a205.beatween.domain.song.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "original_sheets")
public class OriginalSheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sheets_id", nullable = false)
    private Integer sheetsId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "song_id", nullable = false)
    private OriginalSong song;

    @Column(name = "part", length = 20, nullable = false)
    private String part;

    @Column(name = "sheet_url", length = 255, nullable = false)
    private String sheetUrl;
}
