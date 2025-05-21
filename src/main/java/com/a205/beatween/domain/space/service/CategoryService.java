package com.a205.beatween.domain.space.service;

import com.a205.beatween.common.util.S3Util;
import com.a205.beatween.domain.drawing.entity.Drawing;
import com.a205.beatween.domain.drawing.repository.DrawingRepository;
import com.a205.beatween.domain.song.entity.CopySheet;
import com.a205.beatween.domain.song.entity.CopySong;
import com.a205.beatween.domain.song.repository.CopySheetRepository;
import com.a205.beatween.domain.song.repository.CopySongRepository;
import com.a205.beatween.domain.space.dto.CategoryDto;
import com.a205.beatween.domain.space.entity.Category;
import com.a205.beatween.domain.space.entity.Space;
import com.a205.beatween.domain.space.repository.CategoryRepository;
import com.a205.beatween.domain.space.repository.SpaceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {


    private final SpaceRepository spaceRepository;
    private final CategoryRepository categoryRepository;
    private final CopySongRepository copySongRepository;
    private final CopySheetRepository copySheetRepository;
    private final DrawingRepository drawingRepository;
    private final S3Util s3Util;

    @Transactional
    public CategoryDto createCategory(Integer spaceId, String name) {
        if(name.equals("기본")) {
            return null;
        }
        Space space = spaceRepository.getReferenceById(spaceId);
        Category category = Category
                .builder()
                .space(space)
                .name(name)
                .build();
        category = categoryRepository.save(category);
        return CategoryDto
                .builder()
                .categoryId(category.getCategoryId())
                .spaceId(category.getSpace().getSpaceId())
                .name(category.getName())
                .build();
    }

    public List<CategoryDto> getCategories(Integer spaceId) {
        List<Category> categoryList = categoryRepository.findBySpace_SpaceId(spaceId);
        List<CategoryDto> result = new ArrayList<CategoryDto>();
        for (Category category : categoryList) {
            CategoryDto categoryDto = CategoryDto
                    .builder()
                    .categoryId(category.getCategoryId())
                    .spaceId(category.getSpace().getSpaceId())
                    .name(category.getName())
                    .build();
            result.add(categoryDto);
        }
        return result;
    }

    @Transactional
    public CategoryDto updateCategory(Integer categoryId, String name) {
        Category category = categoryRepository.getReferenceById(categoryId);
        if(category.getName().equals("기본")) {
            return null;
        }
        category.setName(name);
        category = categoryRepository.save(category);
        return CategoryDto
                .builder()
                .categoryId(category.getCategoryId())
                .spaceId(category.getSpace().getSpaceId())
                .name(category.getName())
                .build();
    }

    @Transactional
    public void deleteCategory(Integer categoryId) {
        Category category = categoryRepository.getReferenceById(categoryId);
        if(category.getName().equals("기본")) {
            return;
        }
        List<CopySong> copySongList = copySongRepository.findByCategory_CategoryId(categoryId);
        for (CopySong copySong : copySongList) {
            List<CopySheet> copySheetList = copySheetRepository.findByCopySong_CopySongId(copySong.getCopySongId());
            for (CopySheet copySheet : copySheetList) {
                List<Drawing> drawings = drawingRepository.findByCopySheet_CopySheetId(copySheet.getCopySheetId());
                drawingRepository.deleteAll(drawings);
                s3Util.delete(copySheet.getSheetUrl());
                copySheetRepository.delete(copySheet);
            }
            s3Util.delete(copySong.getThumbnailUrl());
            copySongRepository.delete(copySong);
        }
        categoryRepository.deleteById(categoryId);
    }
}
