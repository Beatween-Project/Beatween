package com.a205.beatween.domain.drawing.service;

import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.domain.drawing.dto.DrawingPoint;
import com.a205.beatween.domain.drawing.dto.DrawingUpdateMessage;
import com.a205.beatween.domain.drawing.entity.Drawing;
import com.a205.beatween.domain.drawing.repository.DrawingRepository;
import com.a205.beatween.domain.song.entity.CopySheet;
import com.a205.beatween.domain.song.repository.CopySheetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DrawingServiceImpl implements DrawingService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final DrawingRepository drawingRepository;
    private final CopySheetRepository copySheetRepository;


    private String formatKey(double x, double y) {
        return "%.4f,%.4f".formatted(x, y);
    }

    /**
     * [합주모드]
     * 실시간 드로잉 포인트를 Redis에 캐시
     */
    @Override
    public void updateDrawing(DrawingUpdateMessage message) {
        log.info("🟡 [updateDrawing] 받은 값 → spaceId={}, copySheetId={}, x={}, y={}, erase={}, color={}",
                message.getSpaceId(), message.getCopySheetId(),
                message.getRelativeX(), message.getRelativeY(),
                message.isErase(), message.getColor());

        String key = "drawings:" + message.getSpaceId() + ":" + message.getCopySheetId();
        String fieldKey = formatKey(message.getRelativeX(), message.getRelativeY());

        log.info("🟢 Redis 저장 시도 → key={}, fieldKey={}", key, fieldKey);

        if (message.isErase()) {
            redisTemplate.opsForHash().delete(key, fieldKey);
        } else {
            DrawingPoint point = DrawingPoint.from(message);
            redisTemplate.opsForHash().put(key, fieldKey, point);

            LocalDateTime midnight = LocalDate.now().atTime(23, 59, 59, 999_000_000);
            Date expireAt = Date.from(midnight.atZone(ZoneId.systemDefault()).toInstant());

            redisTemplate.expireAt(key, expireAt);
        }
    }

    /**
     * [합주모드]
     * DB + Redis 통합 드로잉 조회
     */
    @Override
    public List<DrawingPoint> getDrawingBySheet(String spaceId, int copySheetId) {
        CopySheet copySheet = copySheetRepository.findById(copySheetId).orElse(null);
        if (copySheet == null) return Collections.emptyList();

        List<Drawing> drawings = drawingRepository.findByCopySheet(copySheet);
        List<DrawingPoint> dbPoints = drawings.stream()
                .map(d -> DrawingPoint.builder()
                        .relativeX(d.getX())
                        .relativeY(d.getY())
                        .color(d.getColor())
                        .build())
                .toList();

        String redisKey = "drawings:" + spaceId + ":" + copySheetId;
        Map<Object, Object> redisMap = redisTemplate.opsForHash().entries(redisKey);
        List<DrawingPoint> cachedPoints = redisMap.values().stream()
                .filter(DrawingPoint.class::isInstance)
                .map(DrawingPoint.class::cast)
                .toList();

        Map<String, DrawingPoint> merged = new HashMap<>();
        putAllToMap(merged, dbPoints);
        putAllToMap(merged, cachedPoints);

        return new ArrayList<>(merged.values());
    }

    /**
     * [합주모드]
     * 드로잉 캐시 → 병합 후 DB 저장
     */
    @Transactional
    @Override
    public void saveAllDrawingsBySpaceId(String spaceId) {
        String pattern = "drawings:" + spaceId + ":*";
        Set<String> drawingKeys = redisTemplate.keys(pattern);

        if (drawingKeys.isEmpty()) return;

        for (String redisKey : drawingKeys) {
            String[] parts = redisKey.split(":");
            int copySheetId = Integer.parseInt(parts[2]);

            Map<Object, Object> redisMap = redisTemplate.opsForHash().entries(redisKey);
            List<DrawingPoint> redisPoints = redisMap.values().stream()
                    .filter(DrawingPoint.class::isInstance)
                    .map(DrawingPoint.class::cast)
                    .toList();

            CopySheet copySheet = copySheetRepository.findById(copySheetId).orElse(null);
            if (copySheet == null) {
                log.warn("[DRAWING] copySheetId {}에 해당하는 악보 없음 → 건너뜀", copySheetId);
                continue;
            }

            List<Drawing> saved = drawingRepository.findByCopySheet(copySheet);
            List<DrawingPoint> dbPoints = saved.stream()
                    .map(d -> DrawingPoint.builder()
                            .relativeX(d.getX())
                            .relativeY(d.getY())
                            .color(d.getColor())
                            .build())
                    .toList();

            Map<String, DrawingPoint> merged = new HashMap<>();
            putAllToMap(merged, dbPoints);
            putAllToMap(merged, redisPoints);

            int deletedCount = drawingRepository.deleteByCopySheet_CopySheetId(copySheetId);
            if (deletedCount == 0) {
                log.info("[DRAWING] 기존 드로잉 없음 → 새로 저장만 수행 - copySheetId: {}", copySheetId);
            } else {
                log.info("[DRAWING] 기존 드로잉 {}개 삭제됨 - copySheetId: {}", deletedCount, copySheetId);
            }

            List<Drawing> drawings = merged.values().stream()
                    .map(p -> Drawing.builder()
                            .copySheet(copySheet)
                            .x(p.getRelativeX())
                            .y(p.getRelativeY())
                            .color(p.getColor())
                            .build())
                    .toList();

            drawingRepository.saveAll(drawings);
            redisTemplate.delete(redisKey);

            log.info("[DRAWING] 저장 완료 - spaceId: {}, copySheetId: {}, 저장된 개수: {}", spaceId, copySheetId, drawings.size());
        }
    }


    /**
     * [개인연습모드]
     * DB 드로잉 조회
     */
    @Override
    public Result<List<DrawingPoint>> getPersonalDrawing(int copySheetId) {
        List<Drawing> drawings = drawingRepository.findByCopySheet_CopySheetId(copySheetId);

        if (drawings.isEmpty()) {
            return Result.success(List.of());
        }

        List<DrawingPoint> points = drawings.stream()
                .map(d -> DrawingPoint.builder()
                        .relativeX(d.getX())
                        .relativeY(d.getY())
                        .color(d.getColor())
                        .build())
                .toList();

        return Result.success(points);
    }


    /**
     * [개인연습모드]
     * 여러 악보에 대한 드로잉 데이터를 한 번에 저장
     */
    @Override
    public Result<Void> savePersonalDrawings(Map<Integer, List<DrawingPoint>> drawingMap) {
        if (drawingMap == null || drawingMap.isEmpty()) {
            return Result.error(400, "드로잉 데이터가 비어 있습니다.");
        }

        for (Map.Entry<Integer, List<DrawingPoint>> entry : drawingMap.entrySet()) {
            int copySheetId = entry.getKey();
            List<DrawingPoint> points = entry.getValue();

            CopySheet copySheet = copySheetRepository.findById(copySheetId).orElse(null);
            if (copySheet == null) {
                return Result.error(404, "copySheetId %d에 해당하는 악보를 찾을 수 없습니다.".formatted(copySheetId));
            }

            drawingRepository.deleteByCopySheet_CopySheetId(copySheetId);

            List<Drawing> drawings = points.stream()
                    .map(p -> Drawing.builder()
                            .copySheet(copySheet)
                            .x(p.getRelativeX())
                            .y(p.getRelativeY())
                            .color(p.getColor())
                            .build())
                    .toList();

            drawingRepository.saveAll(drawings);
            log.info("[DRAWING] 개인 저장 완료 - copySheetId: {}, 저장된 개수: {}", copySheetId, drawings.size());
        }

        return Result.success(null);
    }


    private void putAllToMap(Map<String, DrawingPoint> target, List<DrawingPoint> source) {
        for (DrawingPoint p : source) {
            String key = formatKey(p.getRelativeX(), p.getRelativeY());
            target.put(key, p);
        }
    }
}
