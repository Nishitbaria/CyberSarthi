export type userCreateFormData = {
  name: string;
  contact: string;
  address: string;
  email: string;
};

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: string;
}
