package com.a205.beatween.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    INVALID_REQUEST(HttpStatus.BAD_REQUEST, 1000, "잘못된 요청입니다."); // 예시입니다

    private final HttpStatus status;
    private final int code;
    private final String message;

    ErrorCode(HttpStatus status, int code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
