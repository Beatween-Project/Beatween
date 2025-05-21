package com.a205.beatween.common.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
	private String key = "BEATWEEN_A_AND_B_SecretKey_SecretKey_SecretKey";
	private SecretKey secretKey = Keys.hmacShaKeyFor(key.getBytes(StandardCharsets.UTF_8));

	public String createToken(String userId) {
		// 유효기간
		long oneWeekInMs = 1000L * 60 * 60 * 24 * 7; // 1주일
		Date exp = new Date(System.currentTimeMillis() + oneWeekInMs); // 1시간
		return Jwts.builder()
				.setSubject(userId) // subject 필드에 사용자 ID 설정
				.setExpiration(exp) // 만료 시간 설정
				.signWith(secretKey) // 비밀키로 서명
				.compact();
	}
	
	// 유효성 검증
	// 실제로 내용물을 확인하는 것은 아니고 실행했을 때 에러가 나는지로 유효성 확인
//	public Jws<Claims> validate(String token) {
//		return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
//	}

	// JWT에서 사용자 ID 추출
	public String extractUserId(String token) {
		Claims claims = Jwts.parser()
				.setSigningKey(secretKey)// 비밀키로 서명 검증
				.parseClaimsJws(token) // 토큰을 파싱하여 JWS(JWT with Signature) 반환
				.getBody(); // Payload 반환
		return claims.getSubject(); // 사용자 ID 반환
	}
}



