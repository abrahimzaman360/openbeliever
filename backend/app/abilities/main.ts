import LearningPath from '#models/learning-path'
import User from '#models/user'
import { Bouncer } from '@adonisjs/bouncer'
export * from './post-abilities.js'

// Learning path abilities
export const manageLearningPath = Bouncer.ability((user: User, path: LearningPath) => {
  return user.id === path.createdById
})

// Topic abilities
export const manageTopic = Bouncer.ability((user: User) => {
  return user.isAdmin === true
})

// Content engagement abilities
export const viewEngagements = Bouncer.ability((user: User, targetUserId: string) => {
  return user.id === targetUserId
})

// Achievement abilities
export const manageAchievements = Bouncer.ability((user: User) => {
  return user.isAdmin === true
})

// User progress abilities
export const viewProgress = Bouncer.ability((user: User, targetUserId: string) => {
  return user.id === targetUserId || user.isAdmin === true
})

// Feedback abilities
export const manageFeedback = Bouncer.ability((user: User, targetUserId: string) => {
  return user.id === targetUserId
})

// Time tracking abilities
export const viewTimeTracking = Bouncer.ability((user: User, targetUserId: string) => {
  return user.id === targetUserId || user.isAdmin === true
})

// Save abilities
export const manageSaves = Bouncer.ability((user: User, targetUserId: string) => {
  return user.id === targetUserId
})

// User abilities
export const manageUsers = Bouncer.ability((user: User) => {
  return user.isAdmin === true
})

export const deleteAccount = Bouncer.ability({ allowGuest: false },
  (user: User) => {
    return user.isAdmin === true
  })
