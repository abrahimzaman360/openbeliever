// app/services/neo4j_service.ts
import neo4j, { Driver } from 'neo4j-driver'
import env from '#start/env'

class Neo4jService {
  private driver: Driver

  constructor() {
    this.driver = neo4j.driver(
      env.get('NEO4J_URL', 'bolt://localhost:7687'),
      neo4j.auth.basic(
        env.get('NEO4J_USERNAME', 'neo4j'),
        env.get('NEO4J_PASSWORD', 'password')
      ),
    )

    // Execute a test query to ensure the connection is working
    this.query('CREATE CONSTRAINT unique_user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;')
    this.query('CREATE INDEX user_id_index IF NOT EXISTS FOR (u:User) ON (u.id)');
  }

  async query(cypher: string, params = {}) {
    const session = this.driver.session()
    try {
      const result = await session.run(cypher, params)
      return result.records.map(record => record.toObject())
    } finally {
      await session.close()
    }
  }

  async close() {
    await this.driver.close()
  }

  async wipeNeo4jDatabase() {
    await neo4jService.query(`MATCH (n) DETACH DELETE n`);
    console.log('🔥 Neo4j database wiped successfully.');
  }
}

const neo4jService = new Neo4jService()

export default neo4jService;
