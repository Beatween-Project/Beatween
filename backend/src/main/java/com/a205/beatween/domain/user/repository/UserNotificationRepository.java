package com.a205.beatween.domain.user.repository;

import com.a205.beatween.domain.user.entity.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Integer> {
}
