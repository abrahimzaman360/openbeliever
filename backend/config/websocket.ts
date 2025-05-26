import env from '#start/env'
import { defineConfig } from 'adonisjs-websocket'

const websocketConfig = defineConfig({
  middleware: [
    () => import('#middleware/container_bindings_middleware'),
    () => import('@adonisjs/session/session_middleware'),
    () => import('@adonisjs/auth/initialize_auth_middleware')

  ],
  redis: {
    enabled: true,
    host: env.get('REDIS_HOST', 'localhost'),
    port: env.get('REDIS_PORT', 6379),
    password: env.get('REDIS_PASSWORD', 'mrtux360'),
    db: 0,
    connectionName: 'subscription'
  },
})

export default websocketConfig
