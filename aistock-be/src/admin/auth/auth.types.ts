/** JWT 中保存的最小管理员身份信息。 */
export interface AdminTokenPayload {
  sub: number;
  username: string;
  role: string;
}

/** 返回给管理端展示的安全账号信息，不包含密码哈希。 */
export interface CurrentAdmin {
  id: number;
  username: string;
  displayName: string;
  role: string;
}
