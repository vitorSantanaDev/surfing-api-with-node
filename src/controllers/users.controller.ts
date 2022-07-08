import { Controller, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { User } from '@src/models/user.model'
import { BaseController } from '.'
import mongoose from 'mongoose'

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body)
      const newUser = await user.save()
      res.status(201).send(newUser)
    } catch (error) {
      const err = error as mongoose.Error.ValidationError
      this.sendCreatedUpdateErrorResponse(res, err)
    }
  }
}
