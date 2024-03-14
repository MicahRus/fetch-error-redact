export interface HttpErrorResponse {
  fullURL: string;
  response: {
    statusCode?: number;
    statusText: string;
    data: any;
  };
  request: {
    baseUri: string;
    path: string;
    method: string;
    data: any;
  };
}

export interface RedactorConfig {
  redactRequestData: boolean;
  redactResponseData: boolean;
  redactQueryData: boolean;
}
