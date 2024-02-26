import { SetMetadata } from '@nestjs/common';
import { AccountType } from 'src/domains/accounts.type';
export const IS_PRIVATE_KEY = 'isPrivate';
export const Private = (accountType: AccountType) =>
  SetMetadata('accountType', accountType);
