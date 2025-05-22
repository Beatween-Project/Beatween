package com.a205.beatween.common.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.net.URL;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Util {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    /**
     * S3에 파일 업로드
     * @param fileBytes 업로드할 파일의 byte[]
     * @param contentType MIME 타입 (예: image/png, application/xml)
     * @param key 업로드 경로 및 파일명 (예: profiles/123.png)
     * @return S3 URL 문자열
     */
    public String upload(byte[] fileBytes, String contentType, String key) {
        try {
            PutObjectRequest req = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(req, RequestBody.fromBytes(fileBytes));

            URL url = s3Client.utilities()
                    .getUrl(b -> b.bucket(bucket).key(key));
            return url.toString();
        } catch (S3Exception e) {
            log.error("S3 upload failed for key={} : {}", key, e.getMessage());
            throw new IllegalStateException("S3 업로드 실패", e);
        }
    }

    /**
     * S3에서 파일 삭제
     * @param sourceUrl 삭제할 파일의 key
     */
    public void delete(String sourceUrl) {
        try {
            // 버킷 호스트명 접두어 제거 → key 추출
            String hostPrefix = "https://" + bucket + ".s3.ap-northeast-2.amazonaws.com/";
            if (!sourceUrl.startsWith(hostPrefix)) {
                throw new IllegalArgumentException("지원하지 않는 S3 URL 형식입니다.");
            }

            String key = sourceUrl.replace(hostPrefix, "");
            DeleteObjectRequest req = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            s3Client.deleteObject(req);
        } catch (S3Exception e) {
            log.error("S3 delete failed for key={} : {}", sourceUrl, e.getMessage());
            throw new IllegalStateException("S3 삭제 실패", e);
        }
    }

    /**
     * S3 URL 반환
     * @param key 파일 key
     * @return 전체 URL 문자열
     */
    public String getUrl(String key) {
        try {
            URL url = s3Client.utilities()
                    .getUrl(b -> b.bucket(bucket).key(key));
            return url.toString();
        } catch (S3Exception e) {
            log.error("S3 URL 조회 실패 key={} : {}", key, e.getMessage());
            throw new IllegalStateException("S3 URL 조회 실패", e);
        }
    }


    /**
     * S3 내부 객체 복사 (source → destination)
     * @param sourceKey 원본 key (예: "sheets/original.xml")
     * @param destinationKey 복사된 key (예: "processed/converted.xml")
     * @return 복사된 객체의 전체 URL
     */
    public String copy(String sourceKey, String destinationKey) {
        try {
            CopyObjectRequest copyRequest = CopyObjectRequest.builder()
                    .sourceBucket(bucket)
                    .sourceKey(sourceKey)
                    .destinationBucket(bucket)
                    .destinationKey(destinationKey)
                    .build();

            s3Client.copyObject(copyRequest);

            URL url = s3Client.utilities()
                    .getUrl(b -> b.bucket(bucket).key(destinationKey));
            return url.toString();
        } catch (S3Exception e) {
            log.error("S3 복사 실패: {} → {} : {}", sourceKey, destinationKey, e.getMessage());
            throw new IllegalStateException("S3 복사 실패", e);
        }
    }

    /**
     * S3 URL로부터 원본 key를 추출하여, 지정한 새 key로 복사
     * @param sourceUrl S3 파일 URL
     * @param destinationKey 새로 저장할 key
     * @return 복사된 객체의 전체 URL
     */
    public String copyFromUrl(String sourceUrl, String destinationKey) {
        try {
            // 버킷 호스트명 접두어 제거 → key 추출
            String hostPrefix = "https://" + bucket + ".s3.ap-northeast-2.amazonaws.com/";
            if (!sourceUrl.startsWith(hostPrefix)) {
                throw new IllegalArgumentException("지원하지 않는 S3 URL 형식입니다.");
            }

            String sourceKey = sourceUrl.replace(hostPrefix, "");

            // 내부 복사 수행
            return this.copy(sourceKey, destinationKey);

        } catch (Exception e) {
            log.error("S3 URL 복사 실패: {} → {} : {}", sourceUrl, destinationKey, e.getMessage());
            throw new IllegalStateException("S3 URL 기반 복사 실패", e);
        }
    }

}
