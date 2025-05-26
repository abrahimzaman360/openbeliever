import User from '#models/user'
import { Bouncer } from '@adonisjs/bouncer'

// Show my profile
export const showMyProfile = Bouncer.ability(async (currentUser: User, requestedUser: User) => {
  return requestedUser.id === currentUser.id!
})


// Show any profile (Admin only)
export const showAnyProfile = Bouncer.ability(async (currentUser: User) => {
  return currentUser.isAdmin
})


// Show all profiles (Admin only)
export const showAllProfiles = Bouncer.ability(async (currentUser: User) => {
  return currentUser.isAdmin
})
