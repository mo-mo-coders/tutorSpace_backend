import { Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../types/types.middleware';


export  default  (theFunc: AsyncHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.resolve(theFunc(req, res, next));
    } catch (error) {
      console.error('AsyncError:', error);
      next(error);
    }
  };
};

