import { customAlphabet } from 'nanoid';

export default function () {
  const RANDOM_ID_BASE =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return customAlphabet(RANDOM_ID_BASE, 50)();
}
