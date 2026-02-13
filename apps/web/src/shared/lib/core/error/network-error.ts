import { ApiError } from "@/shared/api";

export class NetworkError extends ApiError {
  constructor(message = "Erro de conexão") {
    super(0, { message, statusCode: 0 });
    this.name = "NetworkError";
  }
}
