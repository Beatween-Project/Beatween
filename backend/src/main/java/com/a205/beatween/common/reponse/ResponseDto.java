package com.a205.beatween.common.reponse;

import com.a205.beatween.exception.ErrorResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResponseDto<T> {
    private final boolean success;
    private final ErrorResponse error;
    private final T data;

    public static <T> ResponseDto<T> from(Result<T> result) {
        return ResponseDto.<T>builder()
                .success(result.isSuccess())
                .error(result.getError())
                .data(result.getData())
                .build();
    }
}
