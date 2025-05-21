export interface ErrorResponse {
  code: number;
  message: string;
}

export interface ResponseDto<T> {
  success: boolean;
  error: ErrorResponse | null;
  data: T;
}

export interface Result<T> {
  success: boolean;
  data: T;
  error: ErrorResponse | null;
}
