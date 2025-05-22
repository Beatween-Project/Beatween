package com.a205.beatween.common.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class JwtTest {
	public static void main(String[] args) throws InterruptedException {
		// 비밀키가 하나 필요하다!
		String key = "HARU_UNDONG_PROJECT_SecretKey_SecretKey_SecretKey"; // 비밀키 길이 : HS256 사용 시 최소 32bytes, HS384 사용 시 최소 48bytes
		SecretKey secretKey = Keys.hmacShaKeyFor(key.getBytes(StandardCharsets.UTF_8));

		Map<String, String> headers = new HashMap<>();
		headers.put("typ", "JWT");

		// JWT 구조 : 헤더, 페이로드, 서명
//		String token = Jwts.builder() // JWT를 만들 수 있는 빌더를 쓰게 되었음
//				.header() // 빌더 헤더를 만드는 객체가 되었다
//				.add("name", "choi").add(headers).and() // JWT 빌더로 돌아갔다
//				.subject("ssafy").expiration(new Date(System.currentTimeMillis() + 3000)) // 현재 시간 기준으로 3초 유효
//				.signWith(secretKey) // 서명 완료
//				.compact();
//
//		System.out.println(token);
//
//		Thread.sleep(4000);
//
//		Jws<Claims> jwsClaims = Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
//
//		System.out.println(jwsClaims);
	}
}
