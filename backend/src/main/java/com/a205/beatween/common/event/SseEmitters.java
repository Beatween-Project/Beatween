package com.a205.beatween.common.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseEmitters {
    // ConcurrentHashMap을 사용하여 스레드 안전성 보장
    private final Map<String, SseEmitter> emitterMap = new ConcurrentHashMap<>();
    private final Logger logger = LoggerFactory.getLogger(SseEmitters.class);

    // 사용자 ID와 공간 ID로 고유한 키 생성
    private String makeKey(Integer userId, Integer spaceId) {
        return userId + "_" + spaceId;
    }

    // 새로운 Emitter 추가
    public SseEmitter add(Integer userId, Integer spaceId) {
        String key = makeKey(userId, spaceId);
        SseEmitter emitter = new SseEmitter(600_000L); // 10분 타임아웃

        // 완료, 타임아웃, 에러 시 자동 제거 처리
        emitter.onCompletion(() -> {
            logger.info("SSE 연결 완료: {}", key);
            this.remove(userId, spaceId);
        });

        emitter.onTimeout(() -> {
            logger.info("SSE 연결 타임아웃: {}", key);
            emitter.complete();
        });

        emitter.onError(e -> {
            logger.error("SSE 에러 발생: {}", e.getMessage());
            this.remove(userId, spaceId);
        });

        emitterMap.put(key, emitter);
        logger.info("새로운 SSE 연결 추가: {}", key);
        return emitter;
    }

    // Emitter 제거
    public void remove(Integer userId, Integer spaceId) {
        String key = makeKey(userId, spaceId);
        emitterMap.remove(key);
        logger.info("SSE 연결 제거: {}", key);
    }

    // 특정 사용자에게 이벤트 전송
    public void send(Integer userId, Integer spaceId, String eventName, Object data) {
        String key = makeKey(userId, spaceId);
        SseEmitter emitter = emitterMap.get(key);

        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
                logger.info("이벤트 전송 성공 - {}: {}", eventName, key);
            } catch (IOException e) {
                logger.error("이벤트 전송 실패: {}", e.getMessage());
                emitterMap.remove(key);
            }
        }
    }
}