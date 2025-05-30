package com.a205.beatween.domain.space.service;

import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.common.util.S3Util;
import com.a205.beatween.domain.drawing.entity.Drawing;
import com.a205.beatween.domain.drawing.repository.DrawingRepository;
import com.a205.beatween.domain.song.entity.CopySheet;
import com.a205.beatween.domain.song.entity.CopySong;
import com.a205.beatween.domain.song.repository.CopySheetRepository;
import com.a205.beatween.domain.song.repository.CopySongRepository;
import com.a205.beatween.domain.song.service.SongService;
import com.a205.beatween.domain.space.dto.InvitationDto;
import com.a205.beatween.domain.space.dto.CreateTeamDto;
import com.a205.beatween.domain.space.dto.MemberDto;
import com.a205.beatween.domain.space.dto.SpaceDetailResponseDto;
import com.a205.beatween.domain.space.entity.Category;
import com.a205.beatween.domain.space.entity.Space;
import com.a205.beatween.domain.space.entity.UserSpace;
import com.a205.beatween.domain.space.enums.RoleType;
import com.a205.beatween.domain.space.enums.SpaceType;
import com.a205.beatween.domain.space.dto.SpacePreDto;
import com.a205.beatween.domain.space.repository.CategoryRepository;
import com.a205.beatween.domain.space.repository.SpaceRepository;
import com.a205.beatween.domain.space.repository.UserSpaceRepository;
import com.a205.beatween.domain.user.entity.Notification;
import com.a205.beatween.domain.user.entity.User;
import com.a205.beatween.domain.user.entity.UserNotification;
import com.a205.beatween.domain.user.repository.NotificationRepository;
import com.a205.beatween.domain.user.repository.UserNotificationRepository;
import com.a205.beatween.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpaceService {
    private final UserSpaceRepository userSpaceRepository;
    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;
    private final S3Util s3Util;
    private final CategoryRepository categoryRepository;
    private final CopySongRepository copySongRepository;
    private final CopySheetRepository copySheetRepository;
    private final DrawingRepository drawingRepository;
    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public boolean checkUserIsMemberOfSpace(Integer userId, Integer spaceId){
        return userSpaceRepository.existsByUser_UserIdAndSpace_SpaceId(userId, spaceId);
    }

    public CreateTeamDto createTeamSpace(Integer userId, String name, String description, MultipartFile image) {
        // TODO: 로그인 구현 후 userId 추출 로직 추가

        String imageUrl = null;
        if(image != null) {
            imageUrl = saveTeamSpaceImageToS3WhenTeamCreation(image);
        }

        String shareKey = UUID.randomUUID().toString();

        Space newTeamSpace = Space.builder()
                .name(name)
                .description(description)
                .imageUrl(imageUrl)
                .shareKey(shareKey)
                .spaceType(SpaceType.TEAM)
                .createdAt(LocalDateTime.now())
                .build();

        Space savedSpace = spaceRepository.save(newTeamSpace);
        System.out.println("savedSpaceId = " + savedSpace.getSpaceId());

        Category category = Category
                .builder()
                .space(savedSpace)
                .name("기본")
                .build();

        categoryRepository.save(category);

        User user = userRepository.findById(userId).orElse(null);

        Integer savedSpaceId = savedSpace.getSpaceId();
        UserSpace newUserSpace = UserSpace.builder()
                .user(user)
                .space(savedSpace)
                .roleType(RoleType.OWNER)
                .build();
        userSpaceRepository.save(newUserSpace);

        // 스페이스 이름 기반 슬러그 생성
        String slug = getSlug(name);

        String shareUrlWithSlug = "/share/" + slug + "/" + shareKey;

        return CreateTeamDto.builder()
                .name(name)
                .shareKey(shareUrlWithSlug)
                .build();
    }


    public Result<InvitationDto> resolveInvitationLink(Integer userId, String teamSlug, String shareKey) {
        // shareKey로 Space 조회. 만약 이 shareKey로 space를 찾을 수 없다면 잘못된 초대 링크임
        Space space = spaceRepository.findByShareKey(shareKey).orElse(null);
        User user = userRepository.getReferenceById(userId);
        if(space == null) {
            return Result.error(HttpStatus.NOT_FOUND.value(), "잘못된 초대 링크입니다.");
        }

        // 팀 슬러그 검증. 슬러그가 실제 팀 이름으로 생성된 값이 아니라면 조작된 값이므로 잘못된 요청임
        String expectedSlug = getSlug(space.getName());

        if (!teamSlug.equals(expectedSlug)) {
            return Result.error(HttpStatus.BAD_REQUEST.value(), "잘못된 초대 링크입니다.");
        }

        // 현재 유저가 이 팀에 속해있는지 확인
        Integer spaceId = space.getSpaceId();
        boolean isMember = userSpaceRepository.existsByUser_UserIdAndSpace_SpaceId(userId, spaceId);
        InvitationDto invitationDto = InvitationDto.builder()
                .spaceId(spaceId)
                .isMember(isMember)
                .build();

        // 만약 유저가 팀에 속해있지 않다면, 해당 팀에 가입
        if(!isMember) {
            Notification notification = Notification
                    .builder()
                    .type("join_team")
                    .space(space)
                    .content("["+user.getNickname()+"]님이 ["+space.getName()+"]에 참여하셨습니다.")
                    .build();
            notification = notificationRepository.save(notification);

            List<UserSpace> userSpaceList = userSpaceRepository.findBySpace(space);

            for(UserSpace userSpace : userSpaceList) {
                UserNotification userNotification = UserNotification
                        .builder()
                        .user(userSpace.getUser())
                        .notification(notification)
                        .isRead(false)
                        .build();
                userNotificationRepository.save(userNotification);
            }
            UserSpace newUserSpace = UserSpace.builder()
                    .user(userRepository.getById(userId))
                    .space(space)
                    .roleType(RoleType.MEMBER)
                    .build();
            userSpaceRepository.save(newUserSpace);
        }
        return Result.success(invitationDto);
    }


    public Result<String> getTeamSpaceInvitationLink(Integer spaceId) {
        Space space = spaceRepository.findById(spaceId).orElse(null);
        if(space == null) {
            return Result.error(HttpStatus.NOT_FOUND.value(), "해당 spaceId에 해당하는 스페이스를 찾을 수 없습니다.");
        }

        System.out.println("스페이스 이름 : " + space.getName());


        String slug = space.getName()
                .toLowerCase()
                .replaceAll("[^a-z0-9가-힣]+", "-")
                .replaceAll("(^-|-$)", "");

        String shareUrlWithSlug = "/share/" + slug + "/" + space.getShareKey();

        return Result.<String>builder()
                .success(true)
                .data(shareUrlWithSlug)
                .build();
    }


    public String saveTeamSpaceImageToS3WhenTeamCreation(MultipartFile image) {
        byte[] fileBytes;
        try {
            fileBytes = image.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("파일 변환 실패", e);
        }

        String contentType = image.getContentType();

        // 팀 이미지 저장 파일명에 필요한 space_Id의 최댓값을 가져옴
        Integer spaceId = spaceRepository.findMaxSpaceId()
                .orElseThrow(() -> new IllegalStateException("최대 Space ID를 찾을 수 없습니다."));
        spaceId++;

        String key = "space_images/space_id/" + spaceId + contentType;
        return s3Util.upload(fileBytes, contentType, key);
    }


    public String getSlug(String teamName) {
        return teamName
                .toLowerCase()
                .replaceAll("[^a-z0-9가-힣]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    public List<SpacePreDto> getSpaces(Integer userId) {
        return spaceRepository.findByUserId(userId);
    }


    public SpaceDetailResponseDto getSpaceDetail(Integer spaceId, Integer userId) {
        Space space = spaceRepository.getReferenceById(spaceId);
        UserSpace userSpace = userSpaceRepository.findBySpaceAndUser_UserId(space,userId);
        List<UserSpace> userSpaceList = userSpaceRepository.findBySpace(space);
        List<MemberDto> members = new ArrayList<>();
        for (UserSpace member : userSpaceList) {
            User user = userRepository.getReferenceById(member.getUser().getUserId());
            if(user.getDeletedAt() != null) {
                continue;
            }
            MemberDto memberDto = MemberDto
                    .builder()
                    .nickName(user.getNickname())
                    .profileImageUrl(user.getProfileImageUrl())
                    .updateAt(user.getUpdatedAt())
                    .build();
            members.add(memberDto);
        }
        return SpaceDetailResponseDto
                .builder()
                .spaceId(spaceId)
                .spaceName(space.getName())
                .spaceType(space.getSpaceType())
                .roleType(userSpace.getRoleType())
                .description(space.getDescription())
                .spaceType(space.getSpaceType())
                .imageUrl(space.getImageUrl())
                .createAt(space.getCreatedAt())
                .updateAt(space.getUpdatedAt())
                .members(members)
                .build();


    }

    public SpaceDetailResponseDto updateSpace(Integer spaceId, Integer userId, String name, String description, MultipartFile image) throws IOException {
        Space space = spaceRepository.findById(spaceId).orElse(null);
        UserSpace userSpace = userSpaceRepository.findBySpaceAndUser_UserId(space,userId);
        if(space == null || userSpace == null) {
            return null;
        }
        if(name != null) {
            space.setName(name);
        }
        if(description != null) {
            space.setDescription(description);
        }
        if(image != null) {
            String key = "space_images/si".concat(String.valueOf(spaceId)).concat(".png");
            String url = s3Util.upload(image.getBytes(),"image/png", key);
            space.setImageUrl(url);
        }
        space.setUpdatedAt(LocalDateTime.now());
        space = spaceRepository.save(space);

        return getSpaceDetail(spaceId,userId);
    }

    public Integer deleteTeamSpace(Integer spaceId, Integer userId) {
        UserSpace userSpace = userSpaceRepository.findBySpace_SpaceIdAndUser_UserId(spaceId,userId);
        if(userSpace == null) {
            return 1; //"없는 팀 스페이스입니다.";
        }
        if(userSpace.getRoleType().equals(RoleType.OWNER)) {
            List<UserSpace> userSpaceList = userSpaceRepository.findBySpace_SpaceId(spaceId);
            if(userSpaceList.size() > 1) return 2; //"팀원이 남았습니다.";
            List<Category> categoryList = categoryRepository.findBySpace_SpaceId(spaceId);
            for(Category category : categoryList) {
                List<CopySong> copySongList = copySongRepository.findByCategory(category);
                for(CopySong copySong : copySongList) {
                    List<CopySheet> copySheetList = copySheetRepository.findByCopySong(copySong);
                    for(CopySheet copySheet : copySheetList) {
                        List<Drawing> drawingList = drawingRepository.findByCopySheet(copySheet);
                        drawingRepository.deleteAll(drawingList);
                        s3Util.delete(copySheet.getSheetUrl());
                        copySheetRepository.delete(copySheet);
                    }
                    if(copySong.getThumbnailUrl().contains("copy_thumbnails/")) {
                        s3Util.delete(copySong.getThumbnailUrl());
                    }
                    copySongRepository.delete(copySong);
                }
                categoryRepository.delete(category);
            }
        }
        Space space = spaceRepository.findById(spaceId).orElse(null);
        if(space != null && space.getImageUrl() != null) {
            s3Util.delete(space.getImageUrl());
        }
        userSpaceRepository.delete(userSpace);
        return 0; //"팀 스페이스 삭제 완료";
    }

    public Result<Integer> getCurrentParticipantCount(Integer spaceId) {
        String key = "ws:space:" + spaceId + ":sessionCount";
        Object count = redisTemplate.opsForValue().get(key);

        if (count instanceof Long) {
            return Result.success(((Long) count).intValue());
        } else if (count instanceof Integer) {
            return Result.success((Integer) count);
        } else if (count instanceof String) {
            try {
                return Result.success(Integer.parseInt((String) count));
            } catch (NumberFormatException e) {
                return Result.error(400, "Redis 값이 숫자가 아닙니다.");
            }
        } else {
            return Result.error(404, "Redis에 세션 수 정보가 없습니다.");
        }
    }








}