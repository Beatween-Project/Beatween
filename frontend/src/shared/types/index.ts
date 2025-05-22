// 사용자 정보
export interface User {
    id: string;
    name: string;
    avatarUrl: string;
  }
  
  // 악기
  export type Instrument =
    | "Piano"
    | "Violin"
    | "Flute"
    | "Guitar"
    | "Drums"
    | "Saxophone";
  
  // 합주방 정보
  export interface EnsembleRoom {
    id: string;
    name: string;
    bpm: number;
    participants: User[];
    instrumentMap: Record<string, Instrument>;
  }
  
  // 악보
  export interface ScoreData {
    xml: string;
    title: string;
    totalMeasures: number;
  }
  
  // 소켓 메시지 (예시)
  export type SocketMessage =
    | { type: "JOIN"; user: User }
    | { type: "LEAVE"; userId: string }
    | { type: "BPM_CHANGE"; bpm: number }
    | { type: "PLAY"; }
    | { type: "PAUSE"; };
  