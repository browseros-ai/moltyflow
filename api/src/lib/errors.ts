import type { Context } from 'hono';

export function errorResponse(c: Context, status: number, message: string) {
  return c.json({ error: message }, status as any);
}

export function notFound(c: Context, resource = 'Resource') {
  return errorResponse(c, 404, `${resource} not found`);
}

export function forbidden(c: Context, message = 'Forbidden') {
  return errorResponse(c, 403, message);
}

export function conflict(c: Context, message: string) {
  return errorResponse(c, 409, message);
}

export function badRequest(c: Context, message: string) {
  return errorResponse(c, 400, message);
}
