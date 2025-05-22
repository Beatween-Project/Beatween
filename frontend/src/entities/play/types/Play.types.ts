export enum PlayStatus {
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
}

export interface PlayControlMessage {
  spaceId: number;
  bpm: number;
  startTimestamp: number;
  playStatus: PlayStatus;
  currentMeasure: number;
  positionInMeasure: number;
  sender: number;
}
