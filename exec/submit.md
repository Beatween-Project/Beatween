### 1) 서버 정보

| 구분 | 제품·버전 |
| --- | --- |
| **JVM** | Oracle OpenJDK 21.0.6 (Gradle Wrapper사용) |
| **Build Tool** | Gradle Wrapper 8 |
| **WAS** | Spring Boot 3.3.9 (내장 Tomcat 10.1.x) |
| **웹서버** | Nginx 1.25-alpine (Docker) |
| **IDE-Frontend** | Visual Studio Code |
| **IDE-Backend** | IntelliJ IDEA 2025.1 (Community) |
| **IDE-AI** | PyCharm |

### 2) 환경 변수 및 의존성

**(1) Frontend**

| 변수 | 용도 |
| --- | --- |
| **`VITE_APP_BASE_URL`** | 프런트엔드(React SPA)가 실제로 배포-되어 서비스되는 **공식 도메인**. 라우팅, 공유 링크, 쿠키 도메인 지정 등 “외부에 노출되는 서비스 주소”가 필요할 때 참조합니다. |
| **`VITE_API_BASE_URL`** | **REST API 서버(Sprint Boot)** 의 기본 엔드포인트. 프런트 코드에서 `fetch/axios` 호출 시 `import.meta.env.VITE_API_BASE_URL` 로 읽어와 `${…}/api/…` 식으로 조합합니다. |
| **`VITE_BROKER_URL`** | **WebSocket/STOMP 브로커** 접속 주소. 악보 하이라이트·채팅 등 실시간 기능이 필요할 때 소켓 클라이언트가 이 URL로 연결합니다. |

| Node.js | 18.20.8 |
| --- | --- |
| NPM | 10.8.2 |
| React | 19.0.0 |
| Vite | 6.3.1 |
| TypeScript | 5.7.2 |
| Tailwind CSS | 3.4.17 |

---

- Dependencies

| 분류 | 라이브러리 | 설명 |
| --- | --- | --- |
| React | `react` | React 핵심 라이브러리 |
|  | `react-dom` | DOM 렌더링용 React 라이브러리 |
|  | `react-router-dom` | SPA 라우팅 지원 |
|  | `react-konva` | Canvas 기반 그래픽 컴포넌트 |
|  | `react-tooltip` | 툴팁 UI 컴포넌트 |
| 상태관리 | `zustand` | 경량 전역 상태관리 |
| 통신 | `axios` | HTTP 클라이언트 |
| 쿼리 관리 | `@tanstack/react-query` | 비동기 데이터 처리 및 캐싱 |
| 애니메이션 | `framer-motion` | 모션/애니메이션 처리 |
| 웹소켓 | `@stomp/stompjs` | STOMP 프로토콜 클라이언트 |
|  | `sockjs-client` | WebSocket 폴백 지원 |
| SVG/악보 | `verovio` | 악보 렌더링 엔진 |
|  | `@stringsync/vexml` | MusicXML 기반 악보 관리 |
| 유틸 | `classnames` | 조건부 클래스 처리 |
|  | `clsx` | classnames 대체 유틸 |
|  | `nanoid` | 고유 ID 생성기 |
|  | `event-source-polyfill` | SSE 폴리필 |
| Tailwind | `tailwind-merge` | 중복 Tailwind 클래스 병합 |

---

- 개발 도구 (DevDependencies)

| 분류 | 라이브러리 | 설명 |
| --- | --- | --- |
| 빌드 도구 | `vite` | 빠른 번들링 빌드 도구 |
| Vite 플러그인 | `@vitejs/plugin-react` | React 지원 Vite 플러그인 |
| 타입 | `typescript`, `@types/*` | TypeScript + 타입 지원 패키지 |
| 린트 | `eslint`, `eslint-plugin-*` | 코드 스타일 검사 도구 |
|  | `eslint-config-prettier` | Prettier와 ESLint 호환 |
| 포스트CSS | `postcss`, `autoprefixer` | CSS 후처리 플러그인 |
| Tailwind | `tailwindcss` | 유틸리티 CSS 프레임워크 |
| 기타 | `@tanstack/react-query-devtools` | React Query 개발 도구 |
|  | `globals` | ESLint용 글로벌 변수 정의 |

**(2) Backend**

| 환경변수 | 용도 / 설명 |
| --- | --- |
| `SPRING_APPLICATION_NAME` | 해당 Spring Boot 인스턴스의 서비스 ID. Actuator info·로그 프리픽스·Eureka 등록명 등에 사용 |
| `SPRING_DATASOURCE_URL` | MariaDB 접속 URL |
| `SPRING_DATASOURCE_USERNAME` | DB 계정 ID |
| `SPRING_DATASOURCE_PASSWORD` | DB 계정 PW |
| `SPRING_DATASOURCE_DRIVER_CLASS_NAME` | JDBC 드라이버 클래스 |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | 애플리케이션 구동 시 DDL 동작 모드 |
| `SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT` | Hibernate SQL 방언 |
| `SPRING_JPA_HIBERNATE_JDBC_TIMEZONE` | JDBC 타임존 고정 |
| `SPRING_JPA_SHOW_SQL` | 콘솔에 실행 SQL 출력 여부 |
| `SPRING_JPA_FORMAT_SQL` | 출력되는 SQL 포매팅 여부 |
| `CLOUD_AWS_S3_BUCKET` | 기본 S3 버킷명 |
| `CLOUD_AWS_CREDENTIALS_ACCESS_KEY` | AWS Access Key |
| `CLOUD_AWS_CREDENTIALS_SECRET_KEY` | AWS Secret Key |
| `CLOUD_AWS_REGION_STATIC` | S3 리전 |
| `SPRING_DATA_REDIS_HOST` | Redis 호스트 |
| `SPRING_DATA_REDIS_PORT` | Redis 포트 |
| `SPRING_DATA_REDIS_PASSWORD` | Redis 비밀번호(없으면 빈 값) |

---

- Dependencies

| 분류 | 라이브러리 | 설명 |
| --- | --- | --- |
| Spring Core | `spring-boot-starter-web` | MVC + Tomcat 내장 서버 |
|  | `spring-boot-starter-validation` | Bean Validation(JSR 380) |
|  | `spring-boot-starter-websocket` | STOMP/WebSocket 지원 |
|  | `spring-boot-starter-webflux` | WebClient·Reactive API |
| 데이터 액세스 | `spring-boot-starter-data-jpa` | JPA + Hibernate |
|  | `spring-boot-starter-data-redis` | Redis Template·Cache |
|  | `spring-boot-starter-jdbc` | 순수 JDBC 유틸리티 |
| DB 드라이버 | `mysql-connector-j` | MySQL JDBC 드라이버 |
|  | `mariadb-java-client` | MariaDB JDBC 드라이버 |
| 클라우드 | `software.amazon.awssdk:s3` | AWS S3 SDK (v2) |
| 문서화 | `springdoc-openapi-starter-webmvc-ui` | Swagger UI / OpenAPI 3 |
|  | `spring-restdocs-mockmvc` | REST Docs 테스트 스니펫 |
| 보안/JWT | `spring-boot-starter-security` | Spring Security 기본 설정 |
|  | `jjwt-api`, `jjwt-impl`, `jjwt-jackson` | JWT 생성·검증 |
| 빌드 유틸 | `lombok`  | boilerplate 코드 생성 |
| 테스트 | `spring-boot-starter-test` | JUnit5 + Mockito 등 |
|  | `junit-platform-launcher` | IDE 외부 테스트 실행 |

**(3) AI**

| 변수 | 용도 / 설명 |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | AWS SDK 또는 CLI가 요청을 서명할 때 사용하는 액세스 키 ID |
| `AWS_SECRET_ACCESS_KEY` | 액세스 키 ID와 함께 AWS 요청을 암호화·서명하는 시크릿 키 |
| `AWS_REGION` | 기본 작업 리전(예: `ap-northeast-2`) 지정. S3·DynamoDB·SNS 등 AWS 서비스 호출 시 지역 자동 설정 |
| `AWS_S3_BUCKET` | 애플리케이션이 기본으로 사용하는 S3 버킷 이름 |
| `OPENAI_API_KEY` | OpenAI API 호출 시 인증 헤더(`Authorization: Bearer …`)에 들어가는 API 키 |
| `GOOGLE_ID` | 자동화 스크립트 또는 OAuth 클라이언트 구성에서 쓰이는 Google 계정(또는 Client ID) 식별자 |
| `GOOGLE_PW` | Google 계정 비밀번호(또는 서비스 전용 비밀번호) |

### 3) 배포 시 특이사항

- EC2 인스턴스 안에서 Jenkins를 컨테이너로 실행함
- 하나의 EC2 인스턴스에서 Jenkins, NginX, Spring Boot, Redis, FastAPI, Flask를 관리함

### 4) DB 접속 정보 등 포함된 파일 목록

```jsx
SPRING_APPLICATION_NAME=beatween

# MariaDB
SPRING_DATASOURCE_URL= {DB_url}
serverTimezone=UTC&useUnicode=true&characterEncoding=utf8
SPRING_DATASOURCE_USERNAME=S12P31A205
SPRING_DATASOURCE_PASSWORD= {DB_비밀번호}
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.mariadb.jdbc.Driver

# JPA
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.MariaDBDialect
SPRING_JPA_HIBERNATE_JDBC_TIMEZONE=Asia/Seoul
SPRING_JPA_SHOW_SQL=true
SPRING_JPA_FORMAT_SQL=true

# AWS S3
CLOUD_AWS_S3_BUCKET=a205-beatween-bucket
CLOUD_AWS_CREDENTIALS_ACCESS_KEY={access_key}
CLOUD_AWS_CREDENTIALS_SECRET_KEY={secret_key}
CLOUD_AWS_REGION_STATIC=ap-northeast-2

# REDIS
SPRING_DATA_REDIS_HOST=k12a205.p.ssafy.io
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD={redis_passward}
```

---

# 2. 프로젝트에서 사용하는 외부 서비스

| 서비스명 | 용도 | 가입 필요 여부 | 주요 정보 (API Key 등) | 활용 위치 / 관련 코드 |
| --- | --- | --- | --- | --- |
| **Verovio** | 악보 렌더링 엔진 (WebAssembly) | ❌ 없음 | 브라우저에서 직접 실행 | `verovio` 호출부 (React `<Score/>` 컴포넌트) |
| **StompJS + SockJS** | WebSocket(STOMP) 메시징 | ❌ 없음 | 서버 `/ws` 엔드포인트 | `socketStore`, `/app/play/update` 등 |
| **OpenAI Open API Key** | GPT 모델 api를 이용하기 위한 키 발급 | ✅ 필요 | `OPENAI_API_KEY` 환경 변수에 저장 | 백엔드 `OpenAiService` 또는 AI 모듈에서 REST 호출 |
| **MuseScore 3** | 로컬 악보 편집·검증 툴 | ❌ 없음 | Windows 7+ 설치 파일:▶ [MuseScore-3.6.2.548021803-x86.paf.exe](https://ftp.osuosl.org/pub/musescore-nightlies/windows/3x/stable/MuseScore-3.6.2.548021803-x86.paf.exe) (88 MB, 2021-02-08)※ 해당 링크 접속 불가 시 → MuseScore 홈페이지 → **Download** → **Older and unsupported versions** → **MuseScore 3.0–3.6.2** → Windows 7+ | 개발자 로컬 환경에서 MusicXML·MIDI 테스트 및 악보 검수 |

---

# 4. 시연 시나리오

1. 웹 페이지 접속 후 로그인 -> 개인 스페이스로 리다이렉트
2. 개인 스페이스 설명
3. 팀 스페이스로 이동하면서 팀 스페이스 설명 + 수정 화면 잠깐 보여주기
4. 팀 스페이스 에서 곡 생성 : 노래 하나 소개하며 서버에 등록되어 있던 youtube url 입력
5. 생성 노래와 알림 메시지 확인
6. 생성된 악보로 합주하는 페이지 이동
7. 생성된 기타 악보 확인
8. 생성된 드럼 악보로 이동
9. 준비된 서브태블릿으로 같은 합주방의 다른 악보 보여주기 시작
10. 합주 시작 후 마디 이동 확인
11. 합주 멈추고 수정하는 모습 : 짧은 메모(낙서), 지우기 조금 하기
12. 수정한 악보 클릭해서 그 마디부터 합주 시작
13. 내 스페이스에 있던 곡 팀스페이스로 불러오기
