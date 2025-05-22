package com.a205.beatween.domain.drawing.repository;

import com.a205.beatween.domain.drawing.entity.Drawing;
import com.a205.beatween.domain.song.entity.CopySheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface DrawingRepository extends JpaRepository<Drawing, Integer> {

    List<Drawing> findByCopySheet(CopySheet copySheet);

    int deleteByCopySheet_CopySheetId(Integer copySheetId);

    List<Drawing> findByCopySheet_CopySheetId(Integer copySheetId);

}
