export class AppError extends Error {
  public code: number;
  public status: 'fail' | 'error';
  public isOperational: boolean = true;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.status = `${code}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}
