package com.a205.beatween.domain.song.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "original_songs")
public class OriginalSong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "song_id", nullable = false)
    private Integer songId;

    @Column(name = "title", length = 50, nullable = false)
    private String title;

    @Column(name = "youtube_url", length = 255, nullable = false, unique = true)
    private String youtubeUrl;

    @Column(name = "thumbnail_url", length = 255, nullable = false)
    private String thumbnailUrl;

    @Column(name = "bpm", nullable = false)
    private Short bpm;

    @Column(name = "total_measures", nullable = false)
    private Short totalMeasures;

    @OneToMany(
            mappedBy = "song",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<OriginalSheet> sheets = new ArrayList<>();

}
