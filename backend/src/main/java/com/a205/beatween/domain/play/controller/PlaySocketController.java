package com.a205.beatween.domain.play.controller;

import com.a205.beatween.common.reponse.ResponseDto;
import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.domain.play.service.PlayService;
import com.a205.beatween.domain.space.service.SpaceService;
import com.a205.beatween.domain.play.dto.message.PlayControlMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PlaySocketController {
    private final PlayService playService;
    private final SpaceService spaceService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 웹소켓 메시지 수신 시 권한 체크 후 저장 및 브로드캐스트
     *
     * @param message PlayControlMessage (sender 필드에 userId 포함)
     */
    @MessageMapping("/play/update")
    public void updatePlayState(PlayControlMessage message, Principal principal) {
        Integer spaceId = message.getSpaceId();
        Integer userId = Integer.parseInt(principal.getName());
        message.setSender(userId);

        if (spaceId == null) {
            sendError(principal, 400, "밴드 id가 누락되었습니다.");
            return;
        }

        // 권한 확인
        boolean isMember = spaceService.checkUserIsMemberOfSpace(userId, spaceId);
        if (!isMember) {
            sendError(principal, 403, "해당 밴드에 대한 접근 권한이 없습니다.");
            return;
        }

        // 저장
        playService.savePlaySession(message);

        // 브로드캐스트
        String topic = "/topic/play/session/" + message.getSpaceId();
        messagingTemplate.convertAndSend(topic, message);
    }

    /**
     * WebSocket 에러 응답을 사용자 전용 큐로 전송
     *
     * @param principal  사용자 ID
     * @param code    에러 코드
     * @param message 에러 메시지
     */
    private void sendError(Principal principal, int code, String message) {
        if (principal == null) return; // fallback

        Integer userId = Integer.parseInt(principal.getName());

        Result<Object> result = Result.error(code, message);
        ResponseDto<Object> response = ResponseDto.from(result);

        messagingTemplate.convertAndSend("/topic/errors/" + userId, response);
    }


    @MessageMapping("/disconnect")
    public void manualDisconnect(StompHeaderAccessor accessor, Principal principal) {
        String sessionId = accessor.getSessionId();
        String userId = principal != null ? principal.getName() : "null";
        String spaceId = accessor.getSessionAttributes() != null
                ? (String) accessor.getSessionAttributes().get("spaceId")
                : "null";

        log.warn("🟡 [disconnect 요청 수신] sessionId={}, userId={}, spaceId={}", sessionId, userId, spaceId);

        if ("null".equals(spaceId) || "null".equals(userId) || sessionId == null) {
            log.warn("🔴 disconnect 정보 부족 - spaceId={}, userId={}, sessionId={}", spaceId, userId, sessionId);
            return;
        }

        playService.handleManualDisconnect(spaceId, sessionId, userId);
    }

}
