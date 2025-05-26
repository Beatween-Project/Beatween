package com.a205.beatween.domain.user.repository;

import com.a205.beatween.domain.user.dto.NotificationDto;
import com.a205.beatween.domain.user.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    @Query("SELECT new com.a205.beatween.domain.user.dto.NotificationDto(" +
            "un.userNotificationId, n.notificationId, " +
            "n.space.spaceId, n.type, n.content, " +
            "n.createdAt, un.isRead) " +
            "FROM Notification n " +
            "JOIN UserNotification un " +
            "ON n.notificationId = un.notification.notificationId " +
            "WHERE un.user.userId =:userId " +
            "AND un.isRead = false " +
            "ORDER BY n.createdAt DESC ")
    List<NotificationDto> findByUserId(Integer userId);
}
