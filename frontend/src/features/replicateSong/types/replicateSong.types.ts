export interface ReplicateSongParams {
  spaceId: number;
  songId: number;
  data: ReplicateSongRequest;
}

export interface ReplicateSongRequest {
  dest_space_id: number;
  category_id: number;
}
