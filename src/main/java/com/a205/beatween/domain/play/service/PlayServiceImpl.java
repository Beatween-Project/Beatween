package com.a205.beatween.domain.play.service;

import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.domain.drawing.service.DrawingService;
import com.a205.beatween.domain.play.dto.*;
import com.a205.beatween.domain.song.entity.CopySheet;
import com.a205.beatween.domain.song.entity.CopySong;
import com.a205.beatween.domain.song.repository.CopySheetRepository;
import com.a205.beatween.domain.song.repository.CopySongRepository;
import com.a205.beatween.domain.space.entity.Category;
import com.a205.beatween.domain.space.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlayServiceImpl implements PlayService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final DrawingService drawingService;
    private final CopySheetRepository copySheetRepository;
    private final CategoryRepository categoryRepository;
    private final CopySongRepository copySongRepository;

    @Override
    public void savePlaySession(PlayControlMessage message) {
        String key = "play:session:" + message.getSpaceId();
        redisTemplate.opsForValue().set(key, message);
    }

    @Override
    public PlayControlMessage getLatestState(Integer spaceId) {
        String key = "play:session:" + spaceId;
        Object raw = redisTemplate.opsForValue().get(key);

        if (raw instanceof PlayControlMessage message) {
            return message;
        }

        return null;
    }

    @Override
    public boolean isManager(String spaceId, String sessionId) {
        String managerKey = "ws:space:" + spaceId + ":manager";
        String currentManager = (String) redisTemplate.opsForValue().get(managerKey);
        return sessionId.equals(currentManager);
    }

    @Override
    public void sendInitialManagerStatus(String userId, String spaceId, boolean isManager) {
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/play/manager/" + spaceId,
                new ManagerStatusMessage(isManager)
        );
    }

    @Override
    public void broadcastManagerChange(String spaceId, String newManagerSessionId) {
        String userToSessionKey = "ws:space:" + spaceId + ":session:" + newManagerSessionId;
        String newManagerUserId = (String) redisTemplate.opsForValue().get(userToSessionKey);

        messagingTemplate.convertAndSend(
                "/topic/play/manager/" + spaceId,
                new ManagerChangedMessage(newManagerSessionId, newManagerUserId)
        );
    }


    @Override
    public void handleManualDisconnect(String spaceId, String sessionId, String userId) {
        String sessionCountKey = "ws:space:" + spaceId + ":sessionCount";
        String sessionToUserKey = "ws:space:" + spaceId + ":session:" + sessionId;
        String userToSessionKey = "ws:space:" + spaceId + ":user:" + userId;
        String memberKey = "ws:space:" + spaceId + ":members";
        String managerKey = "ws:space:" + spaceId + ":manager";

        Long count = redisTemplate.opsForValue().decrement(sessionCountKey);
        log.info("수동 연결 해제 - spaceId: {}, sessionId: {}, 남은 접속자 수: {}", spaceId, sessionId, count);

        redisTemplate.opsForZSet().remove(memberKey, sessionId);
        redisTemplate.delete(sessionToUserKey);
        redisTemplate.delete(userToSessionKey);

        String currentLeader = (String) redisTemplate.opsForValue().get(managerKey);
        if (Objects.equals(currentLeader, sessionId)) {
            Set<Object> members = redisTemplate.opsForZSet().range(memberKey, 0, 0);
            String newLeader = (members != null && !members.isEmpty())
                    ? members.stream().map(String.class::cast).findFirst().orElse(null)
                    : null;

            if (newLeader != null) {
                redisTemplate.opsForValue().set(managerKey, newLeader);
                log.info("리더 변경 - newLeader: {}", newLeader);
                broadcastManagerChange(spaceId, newLeader);
            }
        }


        if (count != null && count <= 0) {
            Set<String> keys = redisTemplate.keys("drawings:" + spaceId + ":*");
            List<Integer> copySheetIds = keys.stream()
                    .map(k -> Integer.parseInt(k.split(":")[2]))
                    .toList();
            log.info("마지막 사용자 → 드로잉 저장 대상 copySheetIds: {}", copySheetIds);

            drawingService.saveAllDrawingsBySpaceId(spaceId);
            redisTemplate.delete(sessionCountKey);
            redisTemplate.delete(memberKey);
            redisTemplate.delete(managerKey);
            log.info("마지막 사용자 → 캐시 정리 완료: {}", spaceId);
        }
    }

    @Override
    public Result<List<CategoryWithSongsResponse>> getAllSheets(Integer spaceId) {
        List<Category> categories = categoryRepository.findBySpace_SpaceId(spaceId);
        List<CategoryWithSongsResponse> result = new ArrayList<>();

        for (Category category : categories) {
            List<CopySong> copySongs = copySongRepository.findByCategory(category);
            List<SongWithSheetsResponse> songResponses = new ArrayList<>();

            for (CopySong copySong : copySongs) {
                List<CopySheet> copySheets = copySong.getSheets(); // LAZY
                List<SheetInfoResponse> sheetInfos = copySheets.stream().map(sheet ->
                        SheetInfoResponse.builder()
                                .copySheetId(sheet.getCopySheetId())
                                .part(sheet.getPart())
                                .sheetUrl(sheet.getSheetUrl())
                                .build()
                ).toList();

                if (!sheetInfos.isEmpty()) {
                    songResponses.add(SongWithSheetsResponse.builder()
                            .copySongId(copySong.getCopySongId())
                            .title(copySong.getTitle())
                            .sheets(sheetInfos)
                            .build());
                }
            }

            if (!songResponses.isEmpty()) {
                result.add(CategoryWithSongsResponse.builder()
                        .categoryId(category.getCategoryId())
                        .categoryName(category.getName())
                        .songs(songResponses)
                        .build());
            }
        }

        if (result.isEmpty()) {
            return Result.error(404, "해당 스페이스에 등록된 악보 정보가 없습니다.");
        }

        return Result.success(result);
    }


    @Override
    public Result<SheetSelectResponse> selectSheet(SheetSelectRequest req) {
        int spaceId = req.getSpaceId();
        Integer copySongId = req.getCopySongId() == 0 ? null : req.getCopySongId();
        String part = req.getInstrumentPart();
        String songKey = "ws:space:" + spaceId + ":selectedSong";

        if (copySongId != null) {
            redisTemplate.opsForValue().set(songKey, String.valueOf(copySongId));
        } else {
            String stored = (String) redisTemplate.opsForValue().get(songKey);
            if (stored == null) {
                return Result.error(404, "아직 곡이 선택되지 않았습니다.");
            }
            copySongId = Integer.parseInt(stored);
        }

        Optional<CopySheet> optionalSheet =
                copySheetRepository.findByCopySong_CopySongIdAndPart(copySongId, part);

        if (optionalSheet.isEmpty()) {
            return Result.error(404, "선택한 세션에 해당하는 악보가 존재하지 않습니다.");
        }

        CopySheet sheet = optionalSheet.get();

        SheetSelectResponse response = new SheetSelectResponse(
                sheet.getCopySheetId(),
                sheet.getPart(),
                sheet.getSheetUrl()
        );

        return Result.success(response);
    }

}


