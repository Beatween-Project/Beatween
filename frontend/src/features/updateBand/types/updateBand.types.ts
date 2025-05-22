import {
  MemberDto,
  RoleType,
  SpaceType,
} from "@/entities/band/types/Space.types";

export interface SpaceDetailResponseDto {
  spaceId: number;
  spaceName: string;
  description: string;
  imageUrl: string;
  spaceType: SpaceType;
  createAt: string;
  updateAt: string;
  roleType: RoleType;
  members: MemberDto[];
}
