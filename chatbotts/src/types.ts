/* eslint-disable @typescript-eslint/no-unused-vars */
export interface ChatType {
  chat_name:string
   chat_id:string;
  created_at: string;
}

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}
export interface Message{
    id: string;
    user_message:string,
    bot_response:string;
    timestamp: string;
    chatId:string;
    isFailed:boolean;
    isPending:boolean;
}

export interface ValidationErrorResponse {
  detail: ValidationErrorDetail[];
}

export class ApiError extends Error {
  constructor(
   status: number,
    message: string,
   details?: ValidationErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiError';
  
  }
}
