import { Server } from '@overnightjs/core'
import bodyParser from 'body-parser'
import { Application } from 'express'

import './utils/module-alias'
import { ForeCastController } from './controllers/Forecast.controller'
import { BeachesController } from './controllers/beaches.controller'

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
    this.addControllers([forecastController, beachesController])
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
