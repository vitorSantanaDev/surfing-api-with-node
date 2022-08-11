import * as http from 'http'
import { IDecodedUser } from './services/auth'

declare module 'express-serve-static-core' {
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: IDecodedUser
  }
}
