import { Server } from '@overnightjs/core'
import bodyParser from 'body-parser'
import { Application } from 'express'

import './utils/module-alias'
import { ForeCastController } from './controllers/Forecast.controller'

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super()
  }

  public init(): void {
    this.setupExpress()
    this.setupControllers()
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json())
  }

  private setupControllers(): void {
    const forecastController = new ForeCastController()
    this.addControllers([forecastController])
  }

  public getApp(): Application {
    return this.app
  }
}
