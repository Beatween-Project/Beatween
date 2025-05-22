package com.a205.beatween.domain.drawing.scheduler;

import com.a205.beatween.domain.drawing.service.DrawingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DrawingFallbackScheduler {

    private final RedisTemplate<String, Object> redisTemplate;
    private final DrawingService drawingService;

    /**
     * 매일 자정 10분 전 마다 드로잉 캐시 백업 실행
     */
    @Scheduled(cron = "0 50 23 * * *")
    public void runFallback() {
        log.info("[SCHEDULER] 드로잉 fallback 시작");

        Set<String> keys = redisTemplate.keys("ws:space:*:sessionCount");
        if (keys == null || keys.isEmpty()) {
            log.info("[SCHEDULER] 세션 키 없음 → fallback 대상 없음");
            return;
        }

        for (String key : keys) {
            Object value = redisTemplate.opsForValue().get(key);
            Long count = (value instanceof Integer)
                    ? Long.valueOf((Integer) value)
                    : (Long) value;

            if (count != null && count <= 0) {
                String[] parts = key.split(":");
                String spaceId = parts[2];

                try {
                    drawingService.saveAllDrawingsBySpaceId(spaceId);
                    log.info("[SCHEDULER] spaceId {} fallback 완료", spaceId);
                } catch (Exception e) {
                    log.error("[SCHEDULER] spaceId {} fallback 실패: {}", spaceId, e.getMessage());
                }
            }
        }

        log.info("[SCHEDULER] 드로잉 fallback 완료");
    }
}