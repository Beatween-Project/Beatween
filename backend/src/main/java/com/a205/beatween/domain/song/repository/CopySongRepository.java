package com.a205.beatween.domain.song.repository;

import com.a205.beatween.domain.song.entity.CopySong;
import com.a205.beatween.domain.space.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CopySongRepository extends JpaRepository<CopySong, Integer> {
    boolean existsByCopySongIdAndCategory_CategoryId(Integer songId, Integer categoryId);

    List<CopySong> findByCategory(Category category);

    List<CopySong> findByCategory_CategoryId(Integer categoryCategoryId);
}
