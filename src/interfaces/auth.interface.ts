import { Request as ExpressRequest } from 'express';
import { IUser } from './users.interface';

export interface DataStoredInToken {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends ExpressRequest {
  user_id: IUser;
}