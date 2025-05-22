package com.a205.beatween.domain.space.repository;

import com.a205.beatween.domain.space.entity.Category;
import com.a205.beatween.domain.space.entity.Space;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer>  {
    boolean existsByCategoryIdAndSpace_SpaceId(Integer categoryId, Integer spaceId);

    Category getCategoryByName(String name);

    Category getCategoryByNameAndSpace(String name, Space space);

    List<Category> findBySpace_SpaceId(Integer spaceId);
}
