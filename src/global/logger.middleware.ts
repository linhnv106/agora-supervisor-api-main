import { Request, Response, NextFunction } from 'express';

export function LoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.originalUrl !== '/api/health') {
    console.info(
      `${req.method} ${req.originalUrl}: ${JSON.stringify(req.body, null, 2)}`,
    );
  }
  next();
}
