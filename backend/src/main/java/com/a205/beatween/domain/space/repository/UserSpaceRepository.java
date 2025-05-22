package com.a205.beatween.domain.space.repository;

import com.a205.beatween.domain.space.entity.Space;
import com.a205.beatween.domain.space.entity.UserSpace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSpaceRepository extends JpaRepository<UserSpace, Integer> {
    boolean existsByUser_UserIdAndSpace_SpaceId(Integer userId, Integer spaceId);

    List<UserSpace> findBySpace(Space space);

    UserSpace findBySpaceAndUser_UserId(Space space, Integer userId);

    UserSpace findBySpace_SpaceIdAndUser_UserId(Integer spaceSpaceId, Integer userUserId);

    List<UserSpace> findBySpace_SpaceId(Integer spaceSpaceId);
}
