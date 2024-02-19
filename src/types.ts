export interface HttpErrorResponse {
  message: string;
  fullURL: string;
  response: {
    statusCode?: number;
    statusMessage: string;
    data: any;
  };
  request: {
    baseURL: string;
    path: string;
    method: string;
    data: any;
  };
}
