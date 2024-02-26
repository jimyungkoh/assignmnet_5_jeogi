import { Partner, User } from '@prisma/client';
import { AccountType } from 'src/domains/accounts.type';

declare global {
  namespace Express {
    export interface Request {
      user: User;
      partner: Partner;
      [typeName: AccountType]: User | Partner;
    }
  }
}
