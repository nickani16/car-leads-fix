export const PASSWORD_REQUIREMENTS =
  'At least 8 characters, including one uppercase letter and one number.'

export function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  )
}
