import { IntegrationError, ErrorCodes } from '@agent-pay/shared';

export { IntegrationError, ErrorCodes };

export class SDKError extends IntegrationError {
  constructor(
    code: string,
    message: string,
    details?: any,
    statusCode: number = 500
  ) {
    super(code, message, details, statusCode);
    this.name = 'SDKError';
  }
}

export class ValidationError extends SDKError {
  constructor(message: string, details?: any) {
    super(ErrorCodes.VALIDATION_ERROR, message, details, 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends SDKError {
  constructor(message: string, details?: any) {
    super(ErrorCodes.AUTHENTICATION_FAILED, message, details, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends SDKError {
  constructor(message: string, details?: any) {
    super(ErrorCodes.AGENT_PERMISSION_DENIED, message, details, 403);
    this.name = 'AuthorizationError';
  }
}

export class PaymentError extends SDKError {
  constructor(
    code: string = ErrorCodes.TRANSACTION_FAILED,
    message: string,
    details?: any
  ) {
    super(code, message, details, 400);
    this.name = 'PaymentError';
  }
}

export class NetworkError extends SDKError {
  constructor(message: string, details?: any) {
    super(ErrorCodes.NETWORK_CONNECTION_FAILED, message, details, 0);
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends SDKError {
  constructor(message: string, details?: any) {
    super(ErrorCodes.RATE_LIMIT_EXCEEDED, message, details, 429);
    this.name = 'RateLimitError';
  }
}

export class ServerError extends SDKError {
  constructor(message: string, details?: any) {
    super(ErrorCodes.EXTERNAL_SERVICE_ERROR, message, details, 500);
    this.name = 'ServerError';
  }
}

export class TimeoutError extends SDKError {
  constructor(message: string, details?: any) {
    super(ErrorCodes.NETWORK_CONNECTION_FAILED, message, details, 408);
    this.name = 'TimeoutError';
  }
}

// Utility function to convert any error to SDKError
export function normalizeError(error: any): SDKError {
  if (error instanceof SDKError) {
    return error;
  }

  if (error instanceof IntegrationError) {
    return new SDKError(error.code, error.message, error.details, error.statusCode);
  }

  if (error.response) {
    // Axios error with response
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 400) {
      return new ValidationError(
        data?.message || 'Bad request',
        data?.details || data
      );
    } else if (status === 401) {
      return new AuthenticationError(
        data?.message || 'Authentication failed',
        data?.details || data
      );
    } else if (status === 403) {
      return new AuthorizationError(
        data?.message || 'Permission denied',
        data?.details || data
      );
    } else if (status === 429) {
      return new RateLimitError(
        data?.message || 'Rate limit exceeded',
        data?.details || data
      );
    } else if (status >= 500) {
      return new ServerError(
        data?.message || 'Internal server error',
        data?.details || data
      );
    } else {
      return new SDKError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        data?.message || error.message || 'Unknown error',
        data?.details || data,
        status
      );
    }
  }

  if (error.request) {
    // Axios error without response (network error)
    return new NetworkError(
      'Network connection failed',
      { originalError: error.message }
    );
  }

  if (error.code === 'ECONNABORTED') {
    return new TimeoutError(
      'Request timeout',
      { originalError: error.message }
    );
  }

  // Generic error
  return new SDKError(
    ErrorCodes.EXTERNAL_SERVICE_ERROR,
    error.message || 'Unknown error',
    { originalError: error }
  );
}

// Error factory for common errors
export const Errors = {
  validation: (message: string, details?: any) => new ValidationError(message, details),
  authentication: (message: string, details?: any) => new AuthenticationError(message, details),
  authorization: (message: string, details?: any) => new AuthorizationError(message, details),
  payment: (code: string, message: string, details?: any) => new PaymentError(code, message, details),
  network: (message: string, details?: any) => new NetworkError(message, details),
  rateLimit: (message: string, details?: any) => new RateLimitError(message, details),
  server: (message: string, details?: any) => new ServerError(message, details),
  timeout: (message: string, details?: any) => new TimeoutError(message, details),
};