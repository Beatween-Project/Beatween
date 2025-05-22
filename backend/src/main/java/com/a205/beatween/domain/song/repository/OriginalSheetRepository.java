package com.a205.beatween.domain.song.repository;

import com.a205.beatween.domain.song.entity.OriginalSheet;
import com.a205.beatween.domain.song.entity.OriginalSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OriginalSheetRepository extends JpaRepository<OriginalSheet, String> {
    OriginalSheet findBySongAndPart(OriginalSong song, String part);
}
