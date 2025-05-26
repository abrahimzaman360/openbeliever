import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { showAllProfiles } from '#abilities/profile-abilities'

export default class ProfileController {
  public async index({ response, bouncer }: HttpContext) {
    // Check if the current user is an admin
    if (await bouncer.allows(showAllProfiles)) {
      const users = await User.all()
      return response.status(200).json({
        users,
      })
    }

    return response.forbidden({
      error: 'BANPAN 1.0 -> You are not allowed to view all profiles!',
    })
  }

  public async show({ response }: HttpContext) {
    // const requestedUser = await User.findOrFail(params.id)

    // if (await bouncer.allows(showAnyProfile, requestedUser)) {
    //   return response.status(200).json({
    //     user: requestedUser,
    //   })
    // }

    return response.forbidden({
      error: 'BANPAN 1.0 -> You are not allowed to view this profile!',
    })
  }
}
