import { Controller, Get } from '@overnightjs/core'
import { Beach } from '@src/models/beach.model'
import { Forecast } from '@src/services/forecast'
import { Request, Response } from 'express'

const forecast = new Forecast()

@Controller('forecast')
export class ForeCastController {
  @Get('')
  public async getForecastForLoggerUser(
    _: Request,
    response: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({})
      const forecastData = await forecast.processForecastForBeaches(beaches)
      response.status(200).send(forecastData)
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as { message: any }
      response.status(500).send({ error: error.message })
    }
  }
}
