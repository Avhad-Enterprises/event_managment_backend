import { UsersDto } from "../dtos/users.dto";
import DB, { T } from "../database/index.schema";
import { IUser } from "../interfaces/users.interface";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UsersService {

  public async getAllActiveCustomers(): Promise<IUser[]> {
    const users = await DB(T.USERS_TABLE)
      .select("*")
      .where({
        account_type: "customer",
        is_active: true,
        is_banned: false,
      })
      .orderBy("created_at", "desc");

    return users;
  }

  public async getAllActiveAdmins(): Promise<IUser[]> {
    const users = await DB(T.USERS_TABLE)
      .select("*")
      .where({
        account_type: "admin",
        is_active: true,
        is_banned: false,
      })
      .orderBy("created_at", "desc");

    return users;
  }

  public async Insert(data: UsersDto): Promise<IUser> {
    if (isEmpty(data)) throw new HttpException(400, "Data Invalid");
    const existingEmployee = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();
    if (existingEmployee)
      throw new HttpException(409, "Email already registered");

    if (data.username) {
      const existingUsername = await DB(T.USERS_TABLE)
        .where({ username: data.username })
        .first();

      if (existingUsername) {
        throw new HttpException(409, "Username already taken");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    const res = await DB(T.USERS_TABLE).insert(data).returning("*");
    return res[0];
  }

  public async Login(email: string, password: string): Promise<IUser & { token: string }> {
    if (!email || !password) {
      throw new HttpException(400, "Email and password are required");
    }

    const user = await DB(T.USERS_TABLE)
      .where({
        email,
        account_type: 'admin',
        account_status: 'active',
        is_active: true,
        is_banned: false,
      })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found or access denied");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(401, "Incorrect password");
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    return {
      ...user,
      token,
    };
  }


  public async customerLogin(email: string, password: string): Promise<IUser & { token: string }> {
    if (!email || !password) {
      throw new HttpException(400, "Email and password are required");
    }

    const user = await DB(T.USERS_TABLE)
      .where({
        email,
        account_type: 'customer',
        account_status: 'active',
        is_active: true,
        is_banned: false,
      })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found or access denied");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(401, "Incorrect password");
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture,
        account_type: user.account_type,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    return {
      ...user,
      token,
    };
  }

  public async getById(user_id: number): Promise<IUser> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id, is_active: true, account_status: 'active' })
      .first();

    if (!user) throw new HttpException(404, "User not found");
    return user;
  }

  public async updateById(data: UsersDto): Promise<IUser> {
    if (!data.user_id) throw new HttpException(400, "User ID required for update");

    const user = await DB(T.USERS_TABLE)
      .where({ user_id: data.user_id })
      .first();

    if (!user) throw new HttpException(404, "User not found");

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await DB(T.USERS_TABLE)
      .where({ user_id: data.user_id })
      .update({ ...data, updated_at: new Date() })
      .returning("*");

    return updated[0];
  }

  public async softDelete(user_id: number): Promise<IUser> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();

    if (!user) throw new HttpException(404, "User not found");

    const updated = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        is_active: false,
        account_status: '0',
        updated_at: new Date()
      })
      .returning("*");

    return updated[0];
  }

  public async getUserByEmail(email: string): Promise<IUser> {
    return await DB(T.USERS_TABLE).where({ email }).first();
  }

  public async saveResetToken(user_id: number, token: string, expires: Date): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        reset_token: token,
        reset_token_expires: expires,
      });
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await DB(T.USERS_TABLE)
      .where({ reset_token: token })
      .andWhere('reset_token_expires', '>', new Date())
      .first();

    if (!user) throw new HttpException(400, "Invalid or expired token");

    const hashed = await bcrypt.hash(newPassword, 10);

    await DB(T.USERS_TABLE)
      .where({ user_id: user.user_id })
      .update({
        password: hashed,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date(),
      });
  }

  private async getUserByType(user_id: number, account_type: string): Promise<IUser> {
    const user = await DB(T.USERS_TABLE)
      .where({
        user_id,
        account_type,
        account_status: 'active',
        is_active: true,
        is_banned: false,
      })
      .first();

    if (!user) throw new HttpException(404, `${account_type} user not found`);
    return user;
  }

  public getFreelancerById(user_id: number): Promise<IUser> {
    return this.getUserByType(user_id, 'freelancer');
  }

  public getClientById(user_id: number): Promise<IUser> {
    return this.getUserByType(user_id, 'client');
  }

  public getCustomerById(user_id: number): Promise<IUser> {
    return this.getUserByType(user_id, 'customer');
  }

  public getAdminById(user_id: number): Promise<IUser> {
    return this.getUserByType(user_id, 'admin');
  }

  public async createUserInvitation(data: Record<string, any>): Promise<void> {
    const { email } = data;

    if (!email) throw new HttpException(400, "Email is required");

    const exists = await DB(T.USERINVITATIONS).where({ email }).first();
    if (exists) throw new HttpException(409, "User already invited");

    await DB(T.USERINVITATIONS).insert(data);
  }


  public async validateInvitation(email: string, token: string): Promise<void> {
    const invite = await DB(T.USERINVITATIONS)
      .where({ email, invite_token: token, used: false })
      .andWhere('expires_at', '>', new Date())
      .first();

    if (!invite) {
      throw new HttpException(403, "Invalid or expired invitation token");
    }
  }

  public async getAllInvitations(): Promise<any[]> {
    const invitations = await DB(T.USERINVITATIONS)
      .select('*')
      .orderBy('created_at', 'desc');

    return invitations;
  }
}

export default UsersService;
