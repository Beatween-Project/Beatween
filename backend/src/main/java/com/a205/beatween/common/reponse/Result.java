package com.a205.beatween.common.reponse;

import com.a205.beatween.exception.ErrorResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class Result<T> {
    private final boolean success;
    private final T data;
    private final ErrorResponse error;

    public static <T> Result<T> success(T data) {
        return Result.<T>builder()
                .success(true)
                .data(data)
                .error(null)
                .build();
    }

    public static <T> Result<T> error(int code, String message) {
        return Result.<T>builder()
                .success(false)
                .data(null)
                .error(new ErrorResponse(code, message))
                .build();
    }
}
