import { IForecastPoint, StormGlass } from '@src/clients/stormGlass'
import { InternalError } from '@src/utils/errors/internalErros'

export enum BeachePositionTypeEnum {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N'
}

export interface IBeach {
  lat: number
  lng: number
  name: string
  user: string
  position: BeachePositionTypeEnum
}

export interface IBeachForecast extends Omit<IBeach, 'user'>, IForecastPoint {}

export interface ITimeForecast {
  time: string
  forecast: IBeachForecast[]
}

export class ForecasrProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forcast processing: ${message}`)
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  private mapForecastByTime(forecast: IBeachForecast[]): ITimeForecast[] {
    const forecastByTime: ITimeForecast[] = []

    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time)

      if (timePoint) {
        timePoint.forecast.push(point)
      } else {
        forecastByTime.push({ time: point.time, forecast: [point] })
      }
    }
    return forecastByTime
  }

  private enrichedBeachData(
    points: IForecastPoint[],
    beach: IBeach
  ): IBeachForecast[] {
    return points.map((e) => ({
      ...{},
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1
      },
      ...e
    }))
  }

  public async processForecastForBeaches(
    beaches: IBeach[]
  ): Promise<ITimeForecast[]> {
    const pointsWithCorrecSources: IBeachForecast[] = []
    try {
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
        const enrichedBeachData = this.enrichedBeachData(points, beach)

        pointsWithCorrecSources.push(...enrichedBeachData)
      }

      return this.mapForecastByTime(pointsWithCorrecSources)
    } catch (err) {
      throw new ForecasrProcessingInternalError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as { message: any }).message
      )
    }
  }
}
