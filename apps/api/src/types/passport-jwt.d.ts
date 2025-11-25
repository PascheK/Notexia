declare module 'passport-jwt' {
  import { Strategy as PassportStrategyBase } from 'passport-strategy';
  import type { Request } from 'express';

  export type JwtFromRequestFunction = (req: Request) => string | null;

  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey: string;
    ignoreExpiration?: boolean;
  }

  export class Strategy extends PassportStrategyBase {
    constructor(
      options: StrategyOptions,
      verify?: (
        payload: any,
        done: (err: any, user?: any, info?: any) => void,
      ) => void,
    );
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
  };
}
