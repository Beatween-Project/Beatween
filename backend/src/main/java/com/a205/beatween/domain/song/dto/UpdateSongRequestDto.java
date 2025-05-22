package com.a205.beatween.domain.song.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateSongRequestDto {

    private String songName;

    private Integer categoryId;

    @Schema(type = "string", format = "binary")
    private MultipartFile thumbnail;
}
