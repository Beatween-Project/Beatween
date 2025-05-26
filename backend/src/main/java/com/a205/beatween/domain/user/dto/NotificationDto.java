package com.a205.beatween.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {

    @JsonProperty("user_notification_id")
    private Integer userNotificationId;

    @JsonProperty("notification_id")
    private Integer notificationId;

    @JsonProperty("space_id")
    private Integer spaceId;

    @JsonProperty("type")
    private String type;

    @JsonProperty("content")
    private String content;

    @JsonProperty("create_at")
    private LocalDateTime createAt;

    @JsonProperty("is_read")
    private Boolean isRead;

}
