import { ValidationError } from "express-validation";

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorCode = "INTERNAL_SERVER_ERROR";
  let details = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.code;
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    message = "Validation Error";
    errorCode = "VALIDATION_ERROR";
    details = err.details;
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
    errorCode = "UNAUTHORIZED";
  } else if (err.name === "ForbiddenError") {
    statusCode = 403;
    message = "Forbidden";
    errorCode = "FORBIDDEN";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = "Not Found";
    errorCode = "NOT_FOUND";
  }

  const errorResponse = {
    error: {
      code: errorCode,
      message: message,
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(errorResponse);
};

export { errorHandler, AppError };
