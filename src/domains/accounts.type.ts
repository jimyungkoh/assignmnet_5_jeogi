import { Partner, User } from '@prisma/client';

export type AccountType = 'user' | 'partner';

export type AccountEntity =
  | (Pick<User, 'id' | 'email'> & { accountType: 'user' })
  | (Pick<Partner, 'id' | 'email'> & { accountType: 'partner' });
