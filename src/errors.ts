import {
  NOT_FOUND_ERROR_CODE,
  BAD_REQUEST_ERROR_CODE,
  CONFLICT_ERROR_CODE,
  FORBIDDEN_ERROR_CODE,
  UNATHORIZED_ERROR_CODE,
} from "./constants";

export class UnautharizedError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = UNATHORIZED_ERROR_CODE;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class BadRequestError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = BAD_REQUEST_ERROR_CODE;
  }
}

export class ForbiddenError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = FORBIDDEN_ERROR_CODE;
  }
}
export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = NOT_FOUND_ERROR_CODE;
  }
}

export class ConflictError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = CONFLICT_ERROR_CODE;
  }
}
