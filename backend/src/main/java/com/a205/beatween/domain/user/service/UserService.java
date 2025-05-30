package com.a205.beatween.domain.user.service;

import com.a205.beatween.common.jwt.JwtUtil;
import com.a205.beatween.common.jwt.RefreshTokenService;
import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.common.util.S3Util;
import com.a205.beatween.domain.song.dto.CopySongDto;
import com.a205.beatween.domain.song.entity.CopySong;
import com.a205.beatween.domain.song.repository.CopySongRepository;
import com.a205.beatween.domain.space.dto.CategoryAndSongsDto;
import com.a205.beatween.domain.space.dto.SpacePreDto;
import com.a205.beatween.domain.space.entity.Category;
import com.a205.beatween.domain.space.entity.Space;
import com.a205.beatween.domain.space.entity.UserSpace;
import com.a205.beatween.domain.space.enums.RoleType;
import com.a205.beatween.domain.space.enums.SpaceType;
import com.a205.beatween.domain.space.repository.CategoryRepository;
import com.a205.beatween.domain.space.repository.SpaceRepository;
import com.a205.beatween.domain.space.repository.UserSpaceRepository;
import com.a205.beatween.domain.space.service.SpaceService;
import com.a205.beatween.domain.user.dto.LoginDto;
import com.a205.beatween.domain.user.dto.SignupDto;
import com.a205.beatween.domain.user.dto.UserInfoDto;
import com.a205.beatween.domain.user.entity.User;
import com.a205.beatween.domain.user.enums.UserStatus;
import com.a205.beatween.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final SpaceService spaceService;
    private final SpaceRepository spaceRepository;
    private final UserSpaceRepository userSpaceRepository;
    private final CategoryRepository categoryRepository;
    private final CopySongRepository copySongRepository;
    private final S3Util s3Util;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;


    public Result<?> signup(SignupDto signupDto) {
        // 회원가입 시 이메일 중복 체크
        if (userRepository.existsByEmail(signupDto.getEmail())) {
            return Result.error(HttpStatus.BAD_REQUEST.value(), "이미 가입된 이메일입니다.");
        }
        // 회원가입 시 닉네임 중복 체크
        if (userRepository.existsByNickname(signupDto.getNickname())) {
            return Result.error(HttpStatus.BAD_REQUEST.value(), "이미 가입된 닉네임입니다.");
        }

        // 비밀번호 암호화
        String encodedPw = getEncodedPw(signupDto.getPassword());

        // users 테이블에 저장
        User user = User.builder()
                .email(signupDto.getEmail())
                .nickname(signupDto.getNickname())
                .password(encodedPw)
                .profileImageUrl(null)
                .userStatus(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(user);

        // spaces 테이블에 저장
        Space personalSpace = Space.builder()
                .spaceType(SpaceType.PERSONAL)
                .createdAt(LocalDateTime.now())
                .build();
        spaceRepository.save(personalSpace);

        // users_spaces 테이블에 저장
        UserSpace userSpace = UserSpace.builder()
                .user(user)
                .space(personalSpace)
                .roleType(RoleType.OWNER)
                .build();
        userSpaceRepository.save(userSpace);

        return Result.success("회원가입 성공");
    }

    public Result<Map<String, String>> login(LoginDto loginDto) {
        // 인증
        User user = userRepository.findByEmail(loginDto.getEmail()).orElse(null);
        if(user == null) {
            return Result.error(HttpStatus.NOT_FOUND.value(), "이메일 또는 비밀번호가 틀렸습니다.");
        }
        if(!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            return Result.error(HttpStatus.NOT_FOUND.value(), "이메일 또는 비밀번호가 틀렸습니다.");
        }

        // token 생성 및 저장
        String acceessToken = jwtUtil.createAccessToken(user.getUserId().toString());
        String refreshToken = jwtUtil.createRefreshToken(user.getUserId().toString());
        refreshTokenService.storeRefreshToken(user.getUserId().toString(), refreshToken);


        // token 반환
        Map<String, String> data = new HashMap<>();
        data.put("accessToken", acceessToken);
        data.put("refreshToken", refreshToken);
        return Result.success(data);
    }

    public Result<String> logout(Integer userId) {
        refreshTokenService.deleteRefreshToken(userId.toString());
        return Result.success("redis, 쿠키에서 리프레시 토큰 삭제");
    }

    public Result<UserInfoDto> getUserInfo(Integer userId) {
        UserInfoDto userInfoDto = null;

        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            return Result.error(HttpStatus.NOT_FOUND.value(), "유저Id에 해당하는 회원을 찾을 수 없습니다.");
        }
        if(user.getUserStatus() == UserStatus.DELETED) {
            return Result.error(HttpStatus.NOT_FOUND.value(), "탈퇴한 회원입니다.");
        }

        String name = user.getNickname();
        String profileImageUrl = user.getProfileImageUrl();
        List<SpacePreDto> spaces = spaceService.getSpaces(userId);

        // 이 회원의 스페이스 중 spaceType이 PERSONAL인 스페이스를 찾는다.
        SpacePreDto personalSpace = spaces.stream()
                .filter(s -> s.getSpaceType() == SpaceType.PERSONAL)
                .findFirst()
                .orElse(null);
        if(personalSpace == null) {
            return Result.error(HttpStatus.NOT_FOUND.value(), "개인 스페이스를 찾을 수 없는 오류입니다");
        }

        // MySpace의 카테고리를 리스트로 가져온다
        Integer spaceId = personalSpace.getSpaceId();
        List<Category> categories = categoryRepository.findBySpace_SpaceId(spaceId);

        // 카테고리를 돌면서 해당 카테고리에 해당하는 곡들을 가져온다
        List<CategoryAndSongsDto> categoriesAndSongsOfMySpace = new ArrayList<>();
        for (Category cat : categories) {
            List<CopySong> copySongs = copySongRepository.findByCategory(cat);

            // copySongs를 copySongDtos로 변환
            List<CopySongDto> copySongDtos = copySongs.stream()
                    .map(cs -> CopySongDto.builder()
                            .songId(cs.getCopySongId())
                            .categoryId(cs.getCategory().getCategoryId())
                            .title(cs.getTitle())
                            .thumbnailUrl(cs.getThumbnailUrl())
                            .build()
                    )
                    .toList();

            // 카테고리와 곡 리스트를 CategoryAndSongsDto로 묶어서 리스트에 추가
            categoriesAndSongsOfMySpace.add(
                    CategoryAndSongsDto.builder()
                            .categoryId(cat.getCategoryId())
                            .name(cat.getName())
                            .songs(copySongDtos)
                            .build()
            );
        }

        userInfoDto = UserInfoDto.builder()
                .name(name)
                .profileImageUrl(profileImageUrl)
                .spaces(spaces)
                .categoriesAndSongsOfMySpace(categoriesAndSongsOfMySpace)
                .build();

        return Result.success(userInfoDto);
    }

    public void updateUserInfo(Integer userId, String nickName, MultipartFile image) throws IOException {
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            return;
        }

        if(image != null) {
            String key = "user_images/user".concat(String.valueOf(userId)).concat(".png");
            String url = s3Util.upload(image.getBytes(),"image/png", key);
            user.setProfileImageUrl(url);
        }
        if (nickName != null) {
            user.setNickname(nickName);
        }
        userRepository.save(user);

    }

    String getEncodedPw(String pw) {
        return passwordEncoder.encode(pw);
    }
}
