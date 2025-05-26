import neo4jService from '#services/neo4j_service';
import type { HttpContext } from '@adonisjs/core/http'


export default class RecommendationEnginesController {
  public async index({ auth, response }: HttpContext) {
    const userId = (await auth.authenticate()).id;

    if (!userId) {
      return response.badRequest({ error: 'You are not authenticated.' });
    }

    try {
      // Query to find suggested users to follow based on mutual connections
      // Using direct comparison without type conversion for floating point IDs
      const query = `
        MATCH (current:User {id: toString($userId)})-[:FOLLOWS]->(friend:User)
        MATCH (friend)-[:FOLLOWS]->(suggested:User)
        WHERE NOT (current)-[:FOLLOWS]->(suggested) AND suggested.id <> toString($userId)
        RETURN DISTINCT suggested.id AS id, suggested.username AS username,
                        suggested.avatar AS avatar, suggested.name AS name
        LIMIT 5;
      `;

      const results = await neo4jService.query(query, {
        userId: userId,
      });

      console.log('Results-------------------------:', results);

      return response.ok(results);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return response.internalServerError({ error: 'Something went wrong' });
    }
  }
}
