export interface CopySongDto {
  song_id: number;
  category_id: number;
  title: string;
  thumbnail_url: string;
}

export interface CopySongListByCategoryDto {
  category_id: number;
  category_name: string;
  copySongList: CopySongDto[];
}
