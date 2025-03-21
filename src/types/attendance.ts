export interface AttendanceFormData {
  name: string;
  code: string;
  signature: string; 
}

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof AttendanceFormData]?: string[];
  };
}