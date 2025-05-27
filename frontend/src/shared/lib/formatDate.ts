export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  return dateString.slice(0, 10).replace(/-/g, ".");
}

export function formatDateWithTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const isAm = hours < 12;

  const period = isAm ? "오전" : "오후";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return `${yyyy}.${mm}.${dd} ${period} ${String(hours).padStart(
    2,
    "0"
  )}:${minutes}`;
}

export function formatRelativeDate(dateString?: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (isNaN(date.getTime())) return "";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay <= 7) return `${diffDay}일 전`;

  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const isAm = hour < 12;
  const period = isAm ? "오전" : "오후";
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;

  return `${year}.${month}.${day} ${period} ${String(hour).padStart(
    2,
    "0"
  )}:${minute}`;
}
