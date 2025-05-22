export interface UpdateSongRequestDto {
  songName: string;
  categoryId: number;
  thumbnail: File | null;
}
