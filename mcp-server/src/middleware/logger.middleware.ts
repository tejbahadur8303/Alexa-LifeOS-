import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = req.headers['x-request-id']?.toString() || `req_${uuidv4().slice(0, 8)}`;
  req.headers['x-request-id'] = requestId;

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test' && !req.path.includes('/health')) {
      console.log(
        `[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`
      );
    }
  });

  next();
}
