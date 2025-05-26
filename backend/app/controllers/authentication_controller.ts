import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/authentication'
import { errors as authErrors } from '@adonisjs/auth'
import neo4jService from '#services/neo4j_service'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = request.all()
    const payload = await registerValidator.validate(data)

    //  convert email to lowercase
    payload.email = payload.email.toLowerCase()
    payload.username = payload.username.toLowerCase()

    //  check if user already exists
    const userExists = await User.findBy('email', payload.email.toLowerCase())
    if (userExists) {
      return response
        .status(400)
        .json({ code: 'EMAIL_ALREADY_EXISTS', message: 'User already exists' })
    }

    // create new user
    const user = await User.create({
      ...payload,
    })

    // save the user
    await user.save()

    // Store User in Graph Database (Neo4j):
    await neo4jService.query(
      `
      MERGE (u:User {id: $id})
      SET u.name = $name,
          u.username = $username,
          u.email = $email,
          u.isPrivate = $isPrivate,
          u.avatar = CASE WHEN $avatar IS NOT NULL THEN $avatar ELSE u.avatar END
      RETURN u
      `,
      {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isPrivate: user.isPrivate ? 1 : 0,
        avatar: user.avatar || null
      }
    );


    if (!user) {
      return response.status(400).json({ message: 'Registration failed' })
    }

    return response.status(200).json({ message: 'Registration successful' })
  }

  async login({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const payload = await loginValidator.validate({ email, password })

    // check if user exists first
    const userExists = await User.findBy('email', payload.email.toLowerCase())
    if (!userExists) {
      console.log('User not found')
      return response.status(404).json({ message: 'User not found!' })
    }

    try {
      // Attempt to verify user credentials
      const user = await User.verifyCredentials(payload.email.toLowerCase(), password)

      // Log the user in
      await auth.use('web').login(user)

      // Send a success response
      return response.ok({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          created_at: user.createdAt,
        },
      })
    } catch (error) {
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        return response.unauthorized({ message: 'Invalid user credentials' })
      }
      // Log unexpected errors and send a generic response
      console.error('Unexpected error during login:', error)
      return response.internalServerError({ message: 'Internal server error' })
    }
  }

  async logout({ auth, response, session }: HttpContext) {
    // check if user is authenticated
    await auth.authenticate()

    if (auth.user) {
      // logout user
      await auth.use('web').logout()

      // clear session
      session.clear()
      await session.commit()

      // clear cookies
      response.clearCookie('openbeliever-session')

      // redirect to home page
      return response.status(200).redirect('/')
    }

    // user is not authenticated
    return response.status(401).json({ message: 'User not authenticated' })
  }

  async verify({ auth, response }: HttpContext) {
    try {
      await auth.use('web').authenticate()
      return response.status(200).json({ verified: true })
    } catch {
      return response.status(401).json({ verified: false })
    }
  }
}
