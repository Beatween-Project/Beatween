package com.a205.beatween.test.conroller;

import com.a205.beatween.domain.space.dto.CreateTeamDto;
import com.a205.beatween.domain.space.service.SpaceService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Validated
public class TestController {

    private final SpaceService spaceService;

    @GetMapping(value = "/api/test", produces = MediaType.TEXT_HTML_VALUE)
    public String test() {
        return "<h1>TEST COMPELETE BOOGIE ON AND ON!</h1>";
    }


    @PostMapping(value = "/api/test/s3upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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
}
