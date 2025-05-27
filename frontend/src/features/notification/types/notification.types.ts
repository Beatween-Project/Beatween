export type NotificationType = "create_sheet" | "join_team";

export const notificationTypeLabelMap: Record<NotificationType, string> = {
  create_sheet: "악보 생성 완료",
  join_team: "새로운 밴드 멤버",
};

export interface NotificationDto {
  user_notification_id: number;
  notification_id: number;
  space_id: number;
  type: NotificationType;
  content: string;
  create_at: string;
  is_read: boolean;
}
