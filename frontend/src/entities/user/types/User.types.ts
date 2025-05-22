import { SpacePreDto } from "@/entities/band/types/Space.types";
import { CopySongDto } from "@/entities/song/types/CopySong.types";

export interface CategoryAndSongsDto {
  categoryId: number;
  name: string;
  songs: CopySongDto[];
}

export interface UserInfoDto {
  name: string;
  profileImageUrl: string;
  spaces: SpacePreDto[];
  categoriesAndSongsOfMySpace: CategoryAndSongsDto[];
}
