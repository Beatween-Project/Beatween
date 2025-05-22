FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# build 단계에서 생성된 JAR 복사 (와일드카드 사용)
COPY app.jar app.jar

# 애플리케이션 포트 (기본 8080)
EXPOSE 8080

# 컨테이너 시작 명령
ENTRYPOINT ["java","-jar","/app/app.jar"]

