import { ClassMiddleware, Controller, Get } from '@overnightjs/core'
import { authMiddleware } from '@src/middlewares/auth'
import { Beach } from '@src/models/beach.model'
import { Forecast } from '@src/services/forecast'
import { Request, Response } from 'express'

const forecast = new Forecast()

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForeCastController {
  @Get('')
  public async getForecastForLoggerUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id })
      const forecastData = await forecast.processForecastForBeaches(beaches)
      res.status(200).send(forecastData)
    } catch (err) {
      const error = err as { message: string }
      res.status(500).send({ error: error.message })
    }
  }
}
