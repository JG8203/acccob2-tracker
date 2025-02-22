export interface EventFormData {
  code: string;
  label: string;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof EventFormData]?: string[];
  };
}
