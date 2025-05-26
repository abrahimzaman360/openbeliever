import Diary from '#models/diary';
import type { HttpContext } from '@adonisjs/core/http'

export default class DiaryController {
  public async index({ auth, response }: HttpContext) {
    const userId = (await auth.authenticate()).id
    const entries = await Diary.query().where('user_id', userId).orderBy('date', 'desc');
    return response.ok(entries);
  }

  public async store({ auth, request, response }: HttpContext) {
    const userId = (await auth.authenticate()).id;
    const data = request.only(['title', 'content', 'date', 'isPinned']);

    const entry = await Diary.create({ userId: userId, ...data });
    return response.created(entry);
  }

  public async update({ auth, request, params, response }: HttpContext) {
    const userId = (await auth.authenticate()).id;
    const entry = await Diary.findOrFail(params.id);
    const data = request.only(['title', 'content', 'isPinned']);

    if (entry.userId !== userId) {
      return response.forbidden('You are not authorized to update this entry.');
    }

    entry.merge(data);
    await entry.save();
    return response.ok(entry);
  }

  public async destroy({ auth, params, response }: HttpContext) {
    const userId = (await auth.authenticate()).id;
    const entry = await Diary.findOrFail(params.id);

    if (entry.userId !== userId) {
      return response.forbidden('You are not authorized to delete this entry.');
    }

    await entry.delete();
    return response.noContent();
  }
}
