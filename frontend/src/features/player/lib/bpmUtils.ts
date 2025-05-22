export const bpmOptions = [60, 80, 100, 120, 140, 160, 180];

export function isValidBpm(bpm: number): boolean {
  return bpm >= 40 && bpm <= 240;
}

export function bpmRatio(original: number, current: number): number {
  return current / original;
}
export const ratioOptions = [0.25, 0.5, 0.75, 1];
