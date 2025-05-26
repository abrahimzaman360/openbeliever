import env from '#start/env'
import { Neo4jConfig } from '../types/neo4j.js'

const neo4jConfig: Neo4jConfig = {
  url: env.get('NEO4J_URL', 'bolt://localhost:7687'),
  username: env.get('NEO4J_USERNAME', 'neo4j'),
  password: env.get('NEO4J_PASSWORD', 'password'),
}

export default neo4jConfig
