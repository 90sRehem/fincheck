export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: ApiErrorDetail[];
  statusCode: number;
  timestamp?: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: ApiErrorDetail[];
  public readonly response?: ApiErrorResponse;

  constructor(statusCode: number, response?: ApiErrorResponse) {
    super(response?.message || `Request failed with status ${statusCode}`);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.response = response;
    this.errors = response?.errors;

    // Mantém o stack trace correto
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Retorna a primeira mensagem de erro disponível
   */
  getFirstErrorMessage(): string {
    if (this.errors && this.errors.length > 0) {
      return this.errors[0].message;
    }
    return this.message;
  }

  /**
   * Verifica se o erro é de um status específico
   */
  isStatus(status: number): boolean {
    return this.statusCode === status;
  }

  /**
   * Verifica se é erro de validação (422)
   */
  isValidationError(): boolean {
    return this.statusCode === 422;
  }

  /**
   * Verifica se é erro de autenticação (401)
   */
  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Verifica se é erro de permissão (403)
   */
  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Verifica se é erro de not found (404)
   */
  isNotFound(): boolean {
    return this.statusCode === 404;
  }
}
