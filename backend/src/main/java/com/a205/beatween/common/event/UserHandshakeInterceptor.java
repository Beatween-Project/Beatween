package com.a205.beatween.common.event;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.WebSocketHandler;
import com.a205.beatween.common.jwt.JwtUtil;

import java.util.Map;

@Slf4j
@RequiredArgsConstructor
public class UserHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();

            String token = httpRequest.getParameter("token"); // ex: "Bearer eyJ..."
            String spaceId = httpRequest.getParameter("spaceId");

            try {
                if (token != null && token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }

                // 사용자 DB의 PK 추출
                Integer userId = jwtUtil.extractUserId(token); // JWT로부터 PK 추출
                attributes.put("user", new StompPrincipal(userId.toString())); // 반드시 String

                if (spaceId != null) {
                    attributes.put("spaceId", spaceId);
                }

                return true;

            } catch (Exception e) {
                log.warn("WebSocket 토큰 인증 실패", e);
                return false; // 연결 거부
            }
        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {}
}

