import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken } from '../interfaces/auth.interface';
import { RequestWithUser } from '../interfaces/auth.interface';
import { RequestHandler } from 'express';
import DB from '../database/index.schema';
import { IsEmpty } from 'class-validator';

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    console.log('🔓 Authentication disabled - skipping token check for:', req.originalUrl);
    await DB.raw("SET search_path TO public");
    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    next(new HttpException(500, 'Authentication bypass error'));
  }
};

export default authMiddleware;
