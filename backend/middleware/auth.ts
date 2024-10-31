import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

/**
 * Development mode authentication middleware
 * Always authenticates as the default user (id: 1)
 * This is a simplified version for development purposes only
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  // In development mode, always authenticate as default user
  req.user = {
    id: 1,
    username: 'dev_user'
  };
  
  next();
}
