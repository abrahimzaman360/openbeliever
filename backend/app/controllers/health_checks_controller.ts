import { healthChecks } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthChecksController {
  async ping({ response }: HttpContext) {
    try {
      return response.ok({ message: 'pong' })
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        return response.badRequest({ error: 'Database is not reachable' })
      } else {
        return response.badRequest({ error: 'Something went wrong' })
      }
    }
  }

  async handle({ response }: HttpContext) {
    const report = await healthChecks.run()

    if (report.isHealthy) {
      return response.ok(report)
    }

    return response.serviceUnavailable(report)
  }
}
