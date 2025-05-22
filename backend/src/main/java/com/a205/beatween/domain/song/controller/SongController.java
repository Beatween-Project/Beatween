package com.a205.beatween.domain.song.controller;

import com.a205.beatween.common.event.SseEmitters;
import com.a205.beatween.common.jwt.JwtUtil;
import com.a205.beatween.common.reponse.ResponseDto;
import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.domain.song.dto.*;
import com.a205.beatween.domain.song.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/spaces/{spaceId}/songs")
@RequiredArgsConstructor
public class SongController {
    private final SongService songService;
    private final SseEmitters sseEmitters;
    private final JwtUtil jwtUtil;

    @GetMapping("/{songId}/categories/{categoryId}/sheets/{sheetId}")
    public ResponseEntity<ResponseDto<CopySheetResponseDto>> getSheet(
            @PathVariable("spaceId") Integer spaceId,
            @PathVariable("songId") Integer songId,
            @PathVariable("categoryId") Integer categoryId,
            @PathVariable("sheetId") Integer sheetId,
            @RequestHeader("Authorization") String token
    ){
        Integer userId = jwtUtil.extractUserId(token);
        Result<CopySheetResponseDto> result = songService.getCopySheet(userId, spaceId, songId, categoryId, sheetId);
        return ResponseEntity.ok(ResponseDto.from(result));
    }

    @PostMapping("/sheets")
    public ResponseEntity<Void> createSheet(
            @PathVariable("spaceId") Integer spaceId,
            @RequestHeader("Authorization") String token,
            @RequestBody UrlRequestDto urlRequestDto) {

        System.out.println("createSheet() 호출됨");

        Integer userId = jwtUtil.extractUserId(token);
//        System.out.println("/sheets에서 userId : " + userId);
        songService.createSheet(urlRequestDto, userId, spaceId);

        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/sheets/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(
            @PathVariable("spaceId") Integer spaceId,
            @RequestHeader("Authorization") String token) {

        Integer userId = jwtUtil.extractUserId(token);
        SseEmitter emitter = sseEmitters.add(userId, spaceId);

        // 연결 즉시 초기 이벤트 전송
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("SSE 연결이 설정되었습니다."));
        } catch (IOException e) {
            throw new RuntimeException("SSE 연결 실패", e);
        }

        return emitter;
    }

    @DeleteMapping("/{songId}")
    public ResponseEntity<ResponseDto<Object>> deleteSheet(
            @PathVariable("spaceId") Integer spaceId,
            @PathVariable("songId") Integer songId
    ) {
        songService.deleteSheet(spaceId, songId);

        ResponseDto<Object> result = ResponseDto
                .builder()
                .success(true)
                .data("삭제 완료")
                .build();

        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/")
    public ResponseEntity<ResponseDto<Object>> getAllSongs(
            @PathVariable("spaceId") Integer spaceId
    ) {

        List<CopySongListByCategoryDto> songList = songService.getAllSongs(spaceId);

        ResponseDto<Object> result = ResponseDto
                .builder()
                .success(true)
                .data(songList)
                .build();

        return ResponseEntity.ok().body(result);
    }

    @PostMapping("/{songId}")
    public ResponseEntity<ResponseDto<Object>> replicateSong(
            @PathVariable("spaceId") Integer spaceId,
            @PathVariable("songId") Integer songId,
            @RequestBody ReplicateSongRequestDto replicateSongRequestDto
            ) {
        CopySongDto copySongDto = songService.replicateSong(spaceId, songId, replicateSongRequestDto);

        ResponseDto<Object> result = ResponseDto
                .builder()
                .success(true)
                .data(copySongDto)
                .build();

        return ResponseEntity.ok().body(result);
    }

    /**
     * 곡 정보 변경
     * @param updateSongRequestDto 사용자에게 받아온 정보
     */
    @PatchMapping(value = "/{songId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseDto<Object>> updateSong(
            @PathVariable("songId") Integer songId,
            @ModelAttribute UpdateSongRequestDto updateSongRequestDto
    ) throws IOException {
        System.out.println(updateSongRequestDto.toString());
        CopySongDto copySongDto = songService.updateSong(songId, updateSongRequestDto);
        ResponseDto<Object> result = ResponseDto.builder()
                .success(true)
                .data(copySongDto)
                .build();
        return ResponseEntity.ok().body(result);
    }
}
