export class PlatformError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

export class UnauthorizedError extends PlatformError {
  constructor(message = 'Authentication is required.') {
    super(message, 401, 'unauthorized');
  }
}

export class ForbiddenError extends PlatformError {
  constructor(message = 'You do not have access to this resource.') {
    super(message, 403, 'forbidden');
  }
}

export class NotFoundError extends PlatformError {
  constructor(message = 'Resource was not found.') {
    super(message, 404, 'not_found');
  }
}

export class ConflictError extends PlatformError {
  constructor(message = 'Resource already exists.') {
    super(message, 409, 'conflict');
  }
}
