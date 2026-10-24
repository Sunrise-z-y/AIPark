/**
 * 认证接口（当前为前端演示实现）。
 *
 * 接入真实后端时，保留这里的导出类型与函数签名，替换函数体即可，
 * 页面层无需改动。
 */

export interface LoginPayload {
  username: string
  password: string
  remember: boolean
}

export interface RegisterPayload {
  username: string
  phone: string
  password: string
}

export interface AuthUser {
  username: string
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function login(payload: LoginPayload): Promise<AuthUser> {
  await wait(700)
  return { username: payload.username }
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  await wait(850)
  return { username: payload.username }
}
