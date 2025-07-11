import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import HttpException from '../exceptions/HttpException';

const validationMiddleware = (

  type: any,
  value: string | 'body' | 'query' | 'params' = 'body',
  skipMissingProperties: boolean,
  groups: string[],
): RequestHandler => {

  return (req, res, next) => {
    validate(plainToInstance(type, req[value]), { skipMissingProperties, groups }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) =>
          error.constraints ? Object.values(error.constraints).join(', ') : ''
        )
          .filter((msg) => msg.length > 0)
          .join(', ');
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;
