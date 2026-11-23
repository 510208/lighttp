export interface ManagedCookie {
  id: string;
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  hostOnly: boolean;
  persistent: boolean;
  expires: number | null;
  sameSite: "Strict" | "Lax" | "None" | null;
  matchesUrl: boolean;
}

export type CookieInput = Omit<ManagedCookie, "id" | "matchesUrl"> & {
  id?: string;
};
