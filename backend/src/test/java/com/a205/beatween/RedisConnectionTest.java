package com.a205.beatween;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(locations = "classpath:.env.properties")
class RedisConnectionTest {

	@Autowired
	private StringRedisTemplate redisTemplate;

	@Test
	void testPing() {
		// RedisConnectionFactory를 통해 직접 PING 명령을 실행
		RedisConnection connection = redisTemplate.getConnectionFactory().getConnection();
		String pong = connection.ping();
		Assertions.assertEquals("PONG", pong, "Redis PING 응답이 PONG이어야 합니다");
	}

	@Test
	void testSetAndGetValue() {
		String key = "hello";
		String value = "world";

		// 키/값 저장
		redisTemplate.opsForValue().set(key, value);

		// 저장된 값 읽어서 검증
		String loaded = redisTemplate.opsForValue().get(key);
		Assertions.assertEquals(value, loaded, "Redis에 저장한 값을 올바르게 읽어와야 합니다");

		// 테스트 후 정리
		redisTemplate.delete(key);
	}
}
