import { SetupServer } from '@src/server'
import supertest from 'supertest'

let server: SetupServer

beforeAll(async () => {
  server = new SetupServer()
  server.init()
  global.testRequest = supertest(server.getApp())
})

afterAll(async () => server.close())
