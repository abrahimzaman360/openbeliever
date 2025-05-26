import { Driver } from 'neo4j-driver'

export interface Neo4jConfig {
  url: string
  username: string
  password: string
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'neo4j/driver': Driver
  }
}
