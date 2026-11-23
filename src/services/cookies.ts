import { invoke } from "@tauri-apps/api/core";
import type { CookieInput, ManagedCookie } from "@/types/cookies";

export function listCookies(url?: string) {
  return invoke<ManagedCookie[]>("list_cookies", { url: url ?? null });
}

export function saveCookie(cookie: CookieInput) {
  return invoke<void>("save_cookie", { cookie });
}

export function deleteCookie(id: string) {
  return invoke<void>("delete_cookie", { id });
}

export function setCookiePersistence(id: string, persistent: boolean) {
  return invoke<void>("set_cookie_persistence", { id, persistent });
}

export function clearCookies() {
  return invoke<void>("clear_cookies");
}

export function getCookieHeader(ids: string[], url: string) {
  return invoke<string | null>("get_cookie_header", { ids, url });
}
