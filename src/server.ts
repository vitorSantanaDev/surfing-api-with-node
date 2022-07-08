import { Server } from '@overnightjs/core'
import bodyParser from 'body-parser'
import { Application } from 'express'

import './utils/module-alias'

import { ForeCastController } from './controllers/Forecast.controller'
import { BeachesController } from './controllers/beaches.controller'
import { UsersController } from './controllers/users.controller'

import * as database from './database'

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super()
  }

  public async init(): Promise<void> {
    this.setupExpress()
    this.setupControllers()
    await this.databaseSetup()
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json())
  }

  private setupControllers(): void {
    const forecastController = new ForeCastController()
    const beachesController = new BeachesController()
    const usersController = new UsersController()
    this.addControllers([
      forecastController,
      beachesController,
      usersController
    ])
  }

  private async databaseSetup(): Promise<void> {
    await database.connect()
  }

  public async close(): Promise<void> {
    await database.close()
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.info(`Server litening on port: ${this.port} 🔥`)
    })
  }

  public getApp(): Application {
    return this.app
  }
}
