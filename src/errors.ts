/* eslint-disable @typescript-eslint/no-explicit-any */
import { NOT_FOUND_ERROR_CODE, BAD_REQUEST_ERROR_CODE } from "./constants";

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    (this as any).statusCode = BAD_REQUEST_ERROR_CODE;
  }
}
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    (this as any).statusCode = NOT_FOUND_ERROR_CODE;
  }
}
