declare module 'bcrypt' {
  export function hash(
    data: string,
    saltOrRounds: string | number,
  ): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;

  export function genSalt() {
    throw new Error('Function not implemented.');
  }
}
