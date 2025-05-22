package com.a205.beatween;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(locations = "classpath:.env.properties")
class BeatweenApplicationTests {

	@Test
	void contextLoads() {
	}

}
