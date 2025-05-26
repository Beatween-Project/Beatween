package com.a205.beatween.domain.user.service;

import com.a205.beatween.domain.user.entity.Notification;
import com.a205.beatween.domain.user.entity.UserNotification;
import com.a205.beatween.domain.user.repository.NotificationRepository;
import com.a205.beatween.domain.user.repository.UserNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;

    public List<Notification> getNotifications(Integer userId) {
        return notificationRepository.findByUserId(userId);
    }

    public void updateUserNotification(Integer userNotificationId) {
        UserNotification userNotification = userNotificationRepository.getReferenceById(userNotificationId);
        userNotification.setIsRead(true);
        userNotificationRepository.save(userNotification);
    }
}
