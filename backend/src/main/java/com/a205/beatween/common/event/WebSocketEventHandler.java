package com.a205.beatween.common.event;

import com.a205.beatween.domain.play.service.PlayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventHandler {

    private final RedisTemplate<String, Object> redisTemplate;
    private final PlayService playService;

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        long now = System.currentTimeMillis();

        String userId = accessor.getUser() != null ? accessor.getUser().getName() : null;
        String spaceId = accessor.getSessionAttributes() != null
                ? (String) accessor.getSessionAttributes().get("spaceId")
                : null;

        if (spaceId != null && sessionId != null && userId != null) {
            // Redis 등록
            String sessionCountKey = "ws:space:" + spaceId + ":sessionCount";
            String sessionToUserKey = "ws:space:" + spaceId + ":session:" + sessionId;
            String userToSessionKey = "ws:space:" + spaceId + ":user:" + userId;
            String memberKey = "ws:space:" + spaceId + ":members";
            String managerKey = "ws:space:" + spaceId + ":manager";

            redisTemplate.opsForValue().set(sessionToUserKey, userId);
            redisTemplate.opsForValue().set(userToSessionKey, sessionId);
            redisTemplate.opsForZSet().add(memberKey, sessionId, now);

            // 매니저 자동 지정
            if (Boolean.FALSE.equals(redisTemplate.hasKey(managerKey))) {
                redisTemplate.opsForValue().set(managerKey, sessionId);
                log.info("리더 최초 지정 - sessionId: {}", sessionId);
            }

            Long count = redisTemplate.opsForValue().increment(sessionCountKey);
            log.info("WebSocket 연결 - spaceId: {}, 접속자 수: {}", spaceId, count);

            // 매니저 여부 조회 및 전송
            boolean isManager = playService.isManager(spaceId, sessionId);
            new Thread(() -> {
                try {
                    Thread.sleep(300);
                    playService.sendInitialManagerStatus(userId, spaceId, isManager);
                } catch (InterruptedException e) {
                    log.warn("리더 상태 전송 실패", e);
                }
            }).start();

        } else {
            log.warn("WebSocket 연결 시 필요한 정보 누락 (spaceId={}, userId={}, sessionId={})",
                    spaceId, userId, sessionId);
        }
    }

    @EventListener
    public void handleSessionDisconnect(org.springframework.web.socket.messaging.SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String userId = accessor.getUser() != null ? accessor.getUser().getName() : null;
        String spaceId = accessor.getSessionAttributes() != null
                ? (String) accessor.getSessionAttributes().get("spaceId")
                : null;

        log.warn("[SessionDisconnectEvent 감지] sessionId={}, userId={}, spaceId={}", sessionId, userId, spaceId);

        if (sessionId != null && userId != null && spaceId != null) {
            playService.handleManualDisconnect(spaceId, sessionId, userId);
        } else {
            log.warn("⚠세션 종료 정보 부족 - spaceId={}, userId={}, sessionId={}", spaceId, userId, sessionId);
        }
    }

}
