export interface EvaluationFormData {
  name: string;
  signature: string;
  evaluationProof: string;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof EvaluationFormData]?: string[];
  };
  existingEvaluation?: boolean;
}
