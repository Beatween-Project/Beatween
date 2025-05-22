export interface CreateBandRequest {
  name: string;
  description?: string;
  image?: File | null;
}

export interface CreateBandResponse {
  name: string;
  share_url: string;
}