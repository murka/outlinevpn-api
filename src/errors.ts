export class OutlineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OutlineError";
  }
}

export class NotFoundError extends OutlineError {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends OutlineError {
  constructor(message: string = "Invalid input") {
    super(message);
    this.name = "ValidationError";
  }
}
