export interface AdminTokenPayload {
  sub: number;
  username: string;
  role: string;
}

export interface CurrentAdmin {
  id: number;
  username: string;
  displayName: string;
  role: string;
}

