package com.a205.beatween.domain.space.controller;

import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.domain.space.dto.InvitationDto;
import com.a205.beatween.domain.space.dto.CreateTeamDto;
import com.a205.beatween.domain.space.service.SpaceService;
import com.a205.beatween.domain.space.dto.SpaceDetailResponseDto;
import com.a205.beatween.exception.ErrorCode;
import com.a205.beatween.exception.ErrorResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.a205.beatween.common.reponse.ResponseDto;
import com.a205.beatween.domain.space.dto.SpacePreDto;
import com.a205.beatween.domain.space.service.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Validated
    @ResponseStatus(HttpStatus.CREATED)
    public CreateTeamDto createTeamSpace(
            @RequestHeader("X-USER-ID") Integer userId, // 임시 헤더
            @RequestParam("name") @NotBlank String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        // ResponseEntity 없이 리턴 타입을 DTO로 바로 선언
        return spaceService.createTeamSpace(userId, name, description, image);
    }

    @GetMapping("/share/{teamSlug}/{shareKey}")
    public ResponseEntity<Result<?>> handleInvitationLink(
            @RequestHeader("X-USER-ID") Integer userId, // 임시 헤더
            @PathVariable String teamSlug,
            @PathVariable String shareKey
    ) {

        Result<InvitationDto> invitation = spaceService.resolveInvitationLink(userId, teamSlug, shareKey);

        return ResponseEntity.ok(invitation);
    }


    @GetMapping("/")
    public ResponseEntity<ResponseDto<Object>> getSpaces(
            @RequestHeader("X-USER-ID") Integer userId
    ) {
        List<SpacePreDto> spacePreList = spaceService.getSpaces(userId);
        ResponseDto<Object> result = ResponseDto
                .builder()
                .success(true)
                .data(spacePreList)
                .build();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{spaceId}")
    public ResponseEntity<ResponseDto<Object>> getSpaceDetail(
            @PathVariable("spaceId") Integer spaceId,
            @RequestHeader("X-USER-ID") Integer userId
    ) {
        SpaceDetailResponseDto spaceDetail = spaceService.getSpaceDetail(spaceId, userId);
        ResponseDto<Object> result = ResponseDto
                .builder()
                .success(true)
                .data(spaceDetail)
                .build();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/teams/{spaceId}")
    public ResponseEntity<Result<?>> getTeamSpaceInvitationLink(
            @PathVariable("spaceId") Integer spaceId
    ) {
        Result<String> invitationLink = spaceService.getTeamSpaceInvitationLink(spaceId);
        return ResponseEntity.ok(invitationLink);
    }


    @PatchMapping("/{spaceId}")
    public ResponseEntity<ResponseDto<Object>> updateSpace(
            @PathVariable("spaceId") Integer spaceId,
            @RequestHeader("X-USER-ID") Integer userId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws IOException {
        SpaceDetailResponseDto spaceDetail = spaceService.updateSpace(spaceId, userId, name, description, image);
        if (spaceDetail == null) {
            ResponseDto<Object> result = ResponseDto
                    .builder()
                    .success(true)
                    .data("올바르지 않은 요청입니다.")
                    .build();
            return ResponseEntity.ok(result);
        }
        ResponseDto<Object> result = ResponseDto
                .builder()
                .success(true)
                .data(spaceDetail)
                .build();
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/teams/{spaceId}")
    public ResponseEntity<ResponseDto<Object>> deleteTeamSpace(
            @PathVariable("spaceId") Integer spaceId,
            @RequestHeader("X-USER-ID") Integer userId
    ) {
        Integer state = spaceService.deleteTeamSpace(spaceId,userId);
        List<SpacePreDto> spacePreList = spaceService.getSpaces(userId);
        ResponseDto<Object> result = null;
        if (state == 0) {
            result = ResponseDto
                    .builder()
                    .success(true)
                    .data(spacePreList)
                    .build();
        }
        if (state == 1) {
            result = ResponseDto
                    .builder()
                    .success(false)
                    .error(ErrorResponse.of(ErrorCode.INVALID_REQUEST,"없는 스페이스입니다."))
                    .data(spacePreList)
                    .build();
        }
        if (state == 2) {
            result = ResponseDto
                    .builder()
                    .success(false)
                    .error(ErrorResponse.of(ErrorCode.INVALID_REQUEST,"팀원이 남았습니다."))
                    .data(spacePreList)
                    .build();
        }
        return ResponseEntity.ok(result);
    }
}
