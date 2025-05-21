package com.a205.beatween.domain.song.service;

import com.a205.beatween.common.event.SseEmitters;
import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.common.util.S3Util;
import com.a205.beatween.domain.drawing.repository.DrawingRepository;
import com.a205.beatween.domain.song.dto.*;
import com.a205.beatween.domain.song.entity.CopySheet;
import com.a205.beatween.domain.song.entity.CopySong;
import com.a205.beatween.domain.song.entity.OriginalSheet;
import com.a205.beatween.domain.song.entity.OriginalSong;
import com.a205.beatween.domain.song.repository.CopySheetRepository;
import com.a205.beatween.domain.song.repository.CopySongRepository;
import com.a205.beatween.domain.song.repository.OriginalSheetRepository;
import com.a205.beatween.domain.song.repository.OriginalSongRepository;
import com.a205.beatween.domain.space.entity.Category;
import com.a205.beatween.domain.space.entity.Space;
import com.a205.beatween.domain.space.repository.CategoryRepository;
import com.a205.beatween.domain.space.repository.SpaceRepository;
import com.a205.beatween.domain.space.repository.UserSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SongService {
    private final CopySheetRepository copySheetRepository;
    private final CategoryRepository categoryRepository;
    private final CopySongRepository copySongRepository;

    private final WebClient webClient = WebClient.create();
    private final OriginalSongRepository originalSongRepository;
    private final SpaceRepository spaceRepository;
    private final OriginalSheetRepository originalSheetRepository;
    private final S3Util s3Util;
    private final SseEmitters sseEmitters;
    private final DrawingRepository drawingRepository;
    private final UserSpaceRepository userSpaceRepository;


    public Result<CopySheetResponseDto> getCopySheet(Integer userId, Integer spaceId, Integer songId, Integer categoryId, Integer sheetId){
        boolean isMember = userSpaceRepository.existsByUser_UserIdAndSpace_SpaceId(userId, spaceId);
        if(!isMember) {
            return Result.error(HttpStatus.FORBIDDEN.value(), "요청한 사용자가 해당 밴드의 멤버가 아닙니다.");
        }

        boolean isCategoryInSpace = categoryRepository.existsByCategoryIdAndSpace_SpaceId(categoryId, spaceId);
        if (!isCategoryInSpace) {
            return Result.error(HttpStatus.BAD_REQUEST.value(), "요청한 카테고리는 해당 밴드에 속하지 않습니다.");
        }

        boolean isSongInCategory = copySongRepository.existsByCopySongIdAndCategory_CategoryId(songId, categoryId);
        if (!isSongInCategory) {
            return Result.error(HttpStatus.BAD_REQUEST.value(), "선택한 곡은 해당 카테고리에 존재하지 않습니다.");
        }

        CopySheet sheet = copySheetRepository
                .findByCopySheetIdAndCopySong_CopySongId(sheetId, songId)
                .orElse(null); //값이 없다면(not found) null

        if (sheet == null) {
            return Result.error(HttpStatus.NOT_FOUND.value(), "선택한 악보를 찾을 수 없습니다.");
        }

        return Result.success(CopySheetResponseDto.from(sheet));
    }

    @Async
    @Transactional
    public void createSheet(UrlRequestDto urlRequestDto, Integer userId, Integer spaceId) {
        // 처리 시작 이벤트 전송
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("message", "악보 생성을 시작합니다.");
        sseEmitters.send(userId, spaceId, "process", eventData);

        String[][] parts = new String[4][2];
        parts[0][0] = "drum";
        parts[1][0] = "guitar";
        parts[2][0] = "vocal";
        parts[3][0] = "bass";

        OriginalSong checkSong = originalSongRepository.findByYoutubeUrl(urlRequestDto.getYoutubeUrl());
        if(checkSong != null) {
            CopySong copySong = insertCopySong(checkSong, spaceId);
            try {
                // S3에 복사본을 만들어서 올려야함
                for(String[] part : parts) {
                    OriginalSheet checkSheet = originalSheetRepository.findBySongAndPart(checkSong, part[0]);
                    insertCopySheet(copySong, part[0], checkSheet.getSheetUrl());
                }
                Thread.sleep(10000);
            } catch (Exception e) {
                eventData.put("message", "악보 생성 중 오류 발생.");
                sseEmitters.send(userId, spaceId, "error", eventData);

            }
            // 작업 완료 이벤트 전송;
            eventData.put("message", "악보 생성 완료");
            sseEmitters.send(userId, spaceId, "complete", eventData);
            sseEmitters.remove(userId, spaceId);
            return;
        }
        // FastAPI 호출
        callFastApi(urlRequestDto)
                .subscribe(
                        response -> {
                            try {

                                System.out.println("FastAPI 응답: " + response);

                                parts[0][1] = response.getDrumUrl();
                                parts[1][1] = response.getGuitarUrl();
                                parts[2][1] = response.getGuitarUrl();
                                parts[3][1] = response.getBassUrl();

                                OriginalSong originalSong = insertOriginalSong(response);
                                for(String[] part : parts) {
                                    insertOriginalSheet(originalSong,part[0], part[1]);
                                }

                                CopySong copySong = insertCopySong(originalSong, spaceId);

                                // S3에 복사본을 만들어서 올려야함
                                for(String[] part : parts) {
                                    insertCopySheet(copySong, part[0], part[1]);
                                }
                                // 최종 완료 이벤트와 함께 결과 데이터 전송
                                eventData.put("message", "악보 생성 완료");
                                sseEmitters.send(userId, spaceId, "complete", eventData);
                                sseEmitters.remove(userId, spaceId);
                            } catch (Exception e) {
                                eventData.put("message", "악보 처리 중 오류 발생");
                                sseEmitters.send(userId, spaceId, "error", eventData);
                                sseEmitters.remove(userId, spaceId);
                            }
                        },
                        error -> {
                            eventData.put("message", "악보 생성 중 오류 발생");
                            sseEmitters.send(userId, spaceId, "error", eventData);
                            sseEmitters.remove(userId, spaceId);
                            System.err.println("FastAPI 호출 실패: " + error.getMessage());

                        }
                );
    }

    private Mono<CreateSheetResponseDto> callFastApi(UrlRequestDto urlRequestDto) {
        String fastApiUrl = "http://fastapi:8000/ai/transcription";
        return webClient.post()
                .uri(fastApiUrl)
                .bodyValue(urlRequestDto)  // FastAPI 요청 DTO
                .retrieve()
                .bodyToMono(CreateSheetResponseDto.class);  // FastAPI 응답 타입에 맞게 수정
    }

    private OriginalSong insertOriginalSong(CreateSheetResponseDto createSheetResponseDto) {

        OriginalSong originalSong = OriginalSong
                .builder()
                .title(createSheetResponseDto.getTitle())
                .youtubeUrl(createSheetResponseDto.getYoutubeUrl())
                .thumbnailUrl(createSheetResponseDto.getThumbnailUrl())
                .bpm(createSheetResponseDto.getBpm())
                .totalMeasures(createSheetResponseDto.getTotalMeasures())
                .build();

        return originalSongRepository.save(originalSong);
    }

    private CopySong insertCopySong(OriginalSong originalSong, Integer spaceId) {
        Space space = spaceRepository.getReferenceById(spaceId);
        Category category = categoryRepository.getCategoryByNameAndSpace("기본", space);

        CopySong copySong = CopySong
                .builder()
                .originalSong(originalSong)
                .category(category)
                .title(originalSong.getTitle())
                .thumbnailUrl(originalSong.getThumbnailUrl())
                .build();

        return copySongRepository.save(copySong);
    }

    private OriginalSheet insertOriginalSheet(OriginalSong originalSong, String part, String sheetUrl) {
        OriginalSheet originalSheet = OriginalSheet
                .builder()
                .song(originalSong)
                .part(part)
                .sheetUrl(sheetUrl)
                .build();

        return originalSheetRepository.save(originalSheet);
    }

    private CopySheet insertCopySheet(CopySong copySong, String part, String sheetUrl) {
        String newName = "copy_sheets/s".concat(String.valueOf(copySong.getCopySongId())).concat(part).concat(".musicxml");

        String copyUrl = s3Util.copyFromUrl(sheetUrl, newName);

        CopySheet copySheet = CopySheet
                .builder()
                .copySong(copySong)
                .part(part)
                .sheetUrl(copyUrl)
                .build();

        return copySheetRepository.save(copySheet);
    }

    @Transactional
    public void deleteSheet(Integer spaceId, Integer songId) {
        CopySong copySong = copySongRepository.getReferenceById(songId);
        List<CopySheet> copySheetList = copySheetRepository.findByCopySong_CopySongId(songId);
        for(CopySheet copySheet : copySheetList) {
            drawingRepository.deleteByCopySheet_CopySheetId(copySheet.getCopySheetId());
            s3Util.delete(copySheet.getSheetUrl());
            copySheetRepository.deleteById(copySheet.getCopySheetId());
        }
        s3Util.delete(copySong.getThumbnailUrl());
        copySongRepository.deleteById(songId);
    }

    public List<CopySongListByCategoryDto> getAllSongs(Integer spaceId) {
        List<Category> categoryList = categoryRepository.findBySpace_SpaceId(spaceId);
        List<CopySongListByCategoryDto> result = new ArrayList<>();
        for(Category category : categoryList) {
            List<CopySong> copySongList = copySongRepository.findByCategory(category);
            List<CopySongDto> copySongDtoList = new ArrayList<>();
            for(CopySong copySong : copySongList) {
                CopySongDto copySongDto = CopySongDto
                        .builder()
                        .songId(copySong.getCopySongId())
                        .categoryId(category.getCategoryId())
                        .title(copySong.getTitle())
                        .thumbnailUrl(copySong.getThumbnailUrl())
                        .build();
                copySongDtoList.add(copySongDto);
            }
            CopySongListByCategoryDto copySongListDto = CopySongListByCategoryDto
                    .builder()
                    .categoryId(category.getCategoryId())
                    .categoryName(category.getName())
                    .copySongList(copySongDtoList)
                    .build();
            result.add(copySongListDto);
        }
        return result;
    }

    @Transactional
    public CopySongDto replicateSong(Integer spaceId, Integer songId, ReplicateSongRequestDto replicateSongRequestDto) {
        CopySong copySong = copySongRepository.getReferenceById(songId);
        Category destCategory = categoryRepository.getReferenceById(replicateSongRequestDto.getCategoryId());
        CopySong replicateSong = CopySong
                .builder()
                .originalSong(copySong.getOriginalSong())
                .category(destCategory)
                .title(copySong.getTitle())
                .thumbnailUrl(copySong.getOriginalSong().getThumbnailUrl())
                .build();

        CopySong newCopySong = copySongRepository.save(replicateSong);

        List<CopySheet> copySheetList = copySheetRepository.findByCopySong_CopySongId(copySong.getCopySongId());
        for(CopySheet copySheet : copySheetList) {
            String newName = "copy_sheets/s".concat(String.valueOf(copySong.getCopySongId())).concat(copySheet.getPart()).concat(".musicxml");
            String url = s3Util.copyFromUrl(copySheet.getSheetUrl(),newName);
            CopySheet replicateSheet = CopySheet
                    .builder()
                    .copySong(newCopySong)
                    .part(copySheet.getPart())
                    .sheetUrl(url)
                    .build();
            copySheetRepository.save(replicateSheet);
        }

        return CopySongDto
                .builder()
                .songId(newCopySong.getCopySongId())
                .categoryId(newCopySong.getCategory().getCategoryId())
                .title(newCopySong.getTitle())
                .thumbnailUrl(newCopySong.getThumbnailUrl())
                .build();
    }

    @Transactional
    public CopySongDto updateSong(Integer songId, UpdateSongRequestDto updateSongRequestDto) throws IOException {
        CopySong copySong = copySongRepository.getReferenceById(songId);
        if(updateSongRequestDto.getThumbnail() != null) {

            String key = "copy_thumbnails/i".concat(String.valueOf(songId)).concat(".png");
            String url = s3Util.upload(updateSongRequestDto.getThumbnail().getBytes(),"image/png", key);
            copySong.setThumbnailUrl(url);
        }
        if(updateSongRequestDto.getSongName() != null) {
            copySong.setTitle(updateSongRequestDto.getSongName());
        }
        if(updateSongRequestDto.getCategoryId() != null) {
            copySong.setCategory(categoryRepository.getReferenceById(updateSongRequestDto.getCategoryId()));
        }
        copySongRepository.save(copySong);

        return CopySongDto
                .builder()
                .songId(copySong.getCopySongId())
                .categoryId(copySong.getCategory().getCategoryId())
                .title(copySong.getTitle())
                .thumbnailUrl(copySong.getThumbnailUrl())
                .build();
    }
}
