import config, { IConfig } from 'config'

import { InternalError } from '@src/utils/errors/internalErros'
import * as HTTPUtil from '@src/utils/request'

export interface IStormGlassPointSource {
  [key: string]: number
}

export interface IStormGlassPoint {
  readonly time: string
  readonly waveHeight: IStormGlassPointSource
  readonly waveDirection: IStormGlassPointSource
  readonly windSpeed: IStormGlassPointSource
  readonly windDirection: IStormGlassPointSource
  readonly swellHeight: IStormGlassPointSource
  readonly swellDirection: IStormGlassPointSource
  readonly swellPeriod: IStormGlassPointSource
}

export interface IStormGlassForecastResponse {
  hours: IStormGlassPoint[]
}

export interface IForecastPoint {
  time: string
  swellDirection: number
  swellHeight: number
  swellPeriod: number
  waveDirection: number
  waveHeight: number
  windDirection: number
  windSpeed: number
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected error when trying to communicate to StormGlass`
    super(`${internalMessage}: ${message}`)
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected error returned by the StormGlass service`
    super(`${internalMessage}: ${message}`)
  }
}

const stormGlassResourceConfig: IConfig = config.get('App.resources.StormGlass')

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed'
  readonly stormGlassAPISource = 'noaa'
  constructor(protected request = new HTTPUtil.Request()) {}

  private isValidPoint(point: Partial<IStormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource]
    )
  }

  private normalizeResponse(
    points: IStormGlassForecastResponse
  ): IForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => {
      return {
        time: point.time,
        swellDirection: point.swellDirection[this.stormGlassAPISource],
        swellHeight: point.swellHeight[this.stormGlassAPISource],
        swellPeriod: point.swellPeriod[this.stormGlassAPISource],
        waveDirection: point.waveDirection[this.stormGlassAPISource],
        waveHeight: point.waveHeight[this.stormGlassAPISource],
        windDirection: point.windDirection[this.stormGlassAPISource],
        windSpeed: point.windSpeed[this.stormGlassAPISource]
      }
    })
  }

  public async fetchPoints(
    lat: number,
    lng: number
  ): Promise<IForecastPoint[]> {
    try {
      const response = this.request.get<IStormGlassForecastResponse>(
        `${stormGlassResourceConfig.get('apiUrl')}/weather/point?params=${
          this.stormGlassAPIParams
        }&source=${this.stormGlassAPISource}&lat=${lat}&lng=${lng}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get('apiToken')
          }
        }
      )
      return this.normalizeResponse((await response).data)
    } catch (err) {
      if (err instanceof Error && HTTPUtil.Request.isRequestError(err)) {
        const error = HTTPUtil.Request.extractErrorData(err)
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(error.data)} Code: ${error.status}`
        )
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new ClientRequestError((err as { message: any }).message)
    }
  }
}
