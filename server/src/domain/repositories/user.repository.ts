import { injectable } from 'inversify';
import { UserModel, IUser } from '../models/user.model';
import { CustomError } from '../../core/errors/custom-error';

@injectable()
export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async create(data: { email: string; password: string }): Promise<IUser> {
    try {
      const user = new UserModel(data);
      return await user.save();
    } catch (error) {
      throw new CustomError('Failed to create user', 500);
    }
  }
}