export interface SpacePreDto {
  space_id: number;
  space_name: string;
  img_url: string;
  space_type: SpaceType;
}

export interface SpaceDetailDto {
  spaceId: number;
  spaceName: string;
  description: string;
  imageUrl: string | null;
  spaceType: SpaceType;
  createAt: string;
  updateAt: string | null;
  roleType: RoleType;
  members: MemberDto[];
}

export interface MemberDto {
  nickName: string;
  profileImageUrl: string;
}

export type SpaceType = "PERSONAL" | "TEAM";

export type RoleType = "OWNER" | "MEMBER";
