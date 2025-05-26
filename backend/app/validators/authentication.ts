import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().minLength(8),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    username: vine.string().trim(),
    email: vine.string().email().trim(),
    password: vine.string().minLength(8),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string(),
    email: vine.string().email().trim(),
    password: vine.string().minLength(8).confirmed(),
    password_confirmation: vine.string(),
  })
)

export const updatePasswordValidator = vine.compile(
  vine.object({
    current_password: vine.string(),
    password: vine.string().minLength(8).confirmed(),
    password_confirmation: vine.string(),
  })
)
