package com.a205.beatween.domain.song.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "copy_sheets")
public class CopySheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "copy_sheet_id", nullable = false)
    private Integer copySheetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "copy_song_id", nullable = false)
    private CopySong copySong;

    @Column(name = "part", length = 20, nullable = false)
    private String part;

    @Column(name = "sheet_url", length = 255, nullable = false)
    private String sheetUrl;

}