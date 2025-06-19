import { Request, Response, NextFunction } from 'express';
import DB from '../database/index.schema';

declare global {
    namespace Express {
        interface User {
            user_id: string;
        }
        interface Request {
            user?: User;
        }
    }
}

const checkPermission = (section: string, action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const userRole = await DB('users')
            .where('user_id', userId)
            .select('role')
            .first();

        if (!userRole) {
            return res.status(403).json({ message: 'User role not found' });
        }

        const role = userRole.role;

        const permission = await DB('role_permissions')
            .join('permissions', 'role_permissions.permission_id', '=', 'permissions.permission_id')
            .where('role_permissions.user_id', userId)
            .andWhere('role_permissions.section_name', section)
            .andWhere('permissions.permission_name', action)
            .first();

        if (permission) {
            return next();
        } else {
            return res.status(403).json({ message: 'You do not have permission for this action' });
        }
    };
};

export default checkPermission;
