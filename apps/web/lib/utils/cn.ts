import clsx from 'clsx';

export function cn(...inputs: Array<Parameters<typeof clsx>[0]>): string {
  return clsx(inputs);
}
