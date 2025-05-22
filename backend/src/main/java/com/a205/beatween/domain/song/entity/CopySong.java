package com.a205.beatween.domain.song.entity;


import com.a205.beatween.domain.space.entity.Category;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "copy_songs")
public class CopySong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "copy_song_id", nullable = false)
    private Integer copySongId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_song_id", nullable = false)
    private OriginalSong originalSong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "title", length = 50, nullable = false)
    private String title;

    @Column(name = "thumbnail_url", length = 255, nullable = false)
    private String thumbnailUrl;

    @OneToMany(
            mappedBy = "copySong",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<CopySheet> sheets = new ArrayList<>();
}
