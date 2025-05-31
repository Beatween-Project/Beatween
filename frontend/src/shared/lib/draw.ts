// shared/utils/draw.ts

export function normalizePoint(
  x: number,
  y: number,
  container: HTMLDivElement
): { relativeX: number; relativeY: number } {
  const relativeX = x / container.clientWidth;
  const relativeY = y / container.clientHeight;
  return { relativeX, relativeY };
}

export function denormalizePoint(
  relativeX: number,
  relativeY: number,
  container: HTMLDivElement
): { x: number; y: number } {
  const x = relativeX * container.clientWidth;
  const y = relativeY * container.clientHeight;
  return { x, y };
}
