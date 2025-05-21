package com.a205.beatween.domain.play.controller;

import com.a205.beatween.common.reponse.ResponseDto;
import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.domain.play.dto.*;
import com.a205.beatween.domain.play.service.PlayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/play")
@RequiredArgsConstructor
public class PlayController {
    private final PlayService playService;

    @GetMapping("/state/{spaceId}")
    public ResponseEntity<PlayControlMessage> getPlayState(@PathVariable("spaceId") Integer spaceId) {
        PlayControlMessage latest = playService.getLatestState(spaceId);
        return ResponseEntity.ok(latest);
    }

    @GetMapping("/sheets/all/{spaceId}")
    public ResponseEntity<ResponseDto<List<CategoryWithSongsResponse>>> getAllSheets(@PathVariable("spaceId") Integer spaceId) {
        Result<List<CategoryWithSongsResponse>> result = playService.getAllSheets(spaceId);

        if (!result.isSuccess()) {
            return ResponseEntity
                    .status(result.getError().getCode())
                    .body(ResponseDto.from(result));
        }

        return ResponseEntity.ok(ResponseDto.from(result));
    }


    @PostMapping("/spaces/{spaceId}/selected-song")
    public ResponseEntity<ResponseDto<Void>> selectSong(
            @PathVariable Integer spaceId,
            @RequestBody SelectSongRequest request,
            @RequestHeader("Authorization") String token
    ) {
        try {
            if (token.startsWith("Bearer ")) token = token.substring(7);
//            Integer userId = JwtUtil.extractUserId(token);
            Integer userId = 2;

            Result<Void> result = playService.selectSong(
                    spaceId,
                    request.getCopySongId(),
                    userId
            );

            int status = result.isSuccess() ? 200 : result.getError().getCode();
            return ResponseEntity.status(status).body(ResponseDto.from(result));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(ResponseDto.from(Result.error(401, "유효하지 않은 토큰입니다.")));
        }
    }


    @GetMapping("/spaces/{spaceId}/selected-song")
    public ResponseEntity<ResponseDto<SelectedSongResponse>> getSelectedSong(@PathVariable Integer spaceId) {
        Result<SelectedSongResponse> result = playService.getSelectedSong(spaceId);
        int status = result.isSuccess() ? 200 : result.getError().getCode();
        return ResponseEntity.status(status).body(ResponseDto.from(result));
    }

}
