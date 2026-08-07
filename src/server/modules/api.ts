import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PlatformError } from './errors';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function handleApiError(error: unknown) {
  if (error instanceof PlatformError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: error.issues[0]?.message ?? 'Invalid request.' } },
      { status: 400 },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: { code: 'internal_error', message: 'Unexpected Platform error.' } },
    { status: 500 },
  );
}

export async function readJson(request: Request) {
  if (!request.body) {
    return {};
  }
  return request.json().catch(() => ({}));
}
