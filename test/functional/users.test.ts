import { User } from '@src/models/user.model'

describe('Users functional tests', () => {
  beforeEach(async () => User.deleteMany({}))
  describe('when crating a new user', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@email.com',
        password: '12345'
      }

      const response = await global.testRequest.post('/users').send(newUser)
      expect(response.status).toBe(201)
      expect(response.body).toEqual(expect.objectContaining(newUser))
    })
  })
})
