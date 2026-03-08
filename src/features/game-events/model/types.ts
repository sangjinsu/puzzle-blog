export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

export type ApiStatus = 200 | 400 | 409;

export interface APILogEntry {
  id: string;
  timestamp: number;
  method: HttpMethod;
  endpoint: string;
  status: ApiStatus;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
  duration: number;
  stepType: string;
}
