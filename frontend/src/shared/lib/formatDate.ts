export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  return dateString.slice(0, 10).replace(/-/g, ".");
}
