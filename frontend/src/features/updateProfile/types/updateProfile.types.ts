// types/updateProfile.types.ts
export interface UpdateProfileRequestDto {
  nickname: string;
  image?: File | null;
}
