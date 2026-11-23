use cookie_store::{Cookie, CookieDomain, CookieExpiration, RawCookie};
use reqwest::cookie::CookieStore;
use reqwest::header::HeaderValue;
use reqwest::Url;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::{Arc, Mutex, MutexGuard};
use uuid::Uuid;

#[derive(Clone, PartialEq, Serialize, Deserialize)]
struct StoredCookie {
    id: String,
    persistent: bool,
    cookie: Cookie<'static>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CookieInput {
    pub id: Option<String>,
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
    pub secure: bool,
    pub http_only: bool,
    pub host_only: bool,
    pub persistent: bool,
    pub expires: Option<i64>,
    pub same_site: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CookieSummary {
    pub id: String,
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
    pub secure: bool,
    pub http_only: bool,
    pub host_only: bool,
    pub persistent: bool,
    pub expires: Option<i64>,
    pub same_site: Option<String>,
    pub matches_url: bool,
}

pub struct CookieManager {
    entries: Mutex<Vec<StoredCookie>>,
    file_path: PathBuf,
}

impl CookieManager {
    pub fn load(file_path: PathBuf) -> Result<Self, String> {
        let entries: Vec<StoredCookie> = match fs::read(&file_path) {
            Ok(bytes) => serde_json::from_slice(&bytes).map_err(|error| error.to_string())?,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Vec::new(),
            Err(error) => return Err(format!("無法讀取 Cookie Jar: {error}")),
        };
        Ok(Self {
            entries: Mutex::new(
                entries
                    .into_iter()
                    .filter(|entry| entry.persistent && !entry.cookie.is_expired())
                    .collect(),
            ),
            file_path,
        })
    }

    fn lock(&self) -> Result<MutexGuard<'_, Vec<StoredCookie>>, String> {
        self.entries.lock().map_err(|error| error.to_string())
    }

    fn persist(&self, entries: &[StoredCookie]) -> Result<(), String> {
        let path = &self.file_path;
        let saved: Vec<_> = entries
            .iter()
            .filter(|entry| entry.persistent && !entry.cookie.is_expired())
            .collect();
        let bytes = serde_json::to_vec(&saved).map_err(|error| error.to_string())?;
        let parent = path.parent().ok_or("無效的 Cookie Jar 儲存路徑")?;
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        let temporary = parent.join(format!("cookies-{}.tmp", Uuid::new_v4()));
        let result = (|| -> std::io::Result<()> {
            let mut options = OpenOptions::new();
            options.write(true).create_new(true);
            #[cfg(unix)]
            {
                use std::os::unix::fs::OpenOptionsExt;
                options.mode(0o600);
            }
            let mut file = options.open(&temporary)?;
            file.write_all(&bytes)?;
            file.sync_all()?;
            drop(file);
            // 先完整寫入暫存檔再替換，避免程式中斷留下半份 Cookie 資料。
            fs::rename(&temporary, path)
        })();
        if let Err(error) = result {
            let _ = fs::remove_file(temporary);
            return Err(format!("無法儲存 Cookie Jar: {error}"));
        }
        Ok(())
    }

    fn update<T>(
        &self,
        change: impl FnOnce(&mut Vec<StoredCookie>) -> Result<T, String>,
    ) -> Result<T, String> {
        let mut entries = self.lock()?;
        let mut updated = entries.clone();
        updated.retain(|entry| !entry.cookie.is_expired());
        let result = change(&mut updated)?;
        // 寫入成功才更新記憶體，確保停用持久儲存或刪除失敗時仍可重試。
        // 純記憶體 Cookie 的變動不需存取磁碟。
        if entries
            .iter()
            .filter(|entry| entry.persistent)
            .ne(updated.iter().filter(|entry| entry.persistent))
        {
            self.persist(&updated)?;
        }
        *entries = updated;
        Ok(result)
    }

    pub fn list(&self, url: Option<&str>) -> Result<Vec<CookieSummary>, String> {
        let url = url.map(parse_http_url).transpose()?;
        Ok(self
            .lock()?
            .iter()
            .filter(|entry| !entry.cookie.is_expired())
            .map(|entry| entry.summary(url.as_ref()))
            .collect())
    }

    pub fn upsert(&self, input: CookieInput) -> Result<(), String> {
        let cookie = input.to_cookie()?;
        self.update(|entries| {
            let existing = if let Some(id) = &input.id {
                Some(
                    entries
                        .iter()
                        .position(|entry| &entry.id == id)
                        .ok_or("Cookie 已不存在")?,
                )
            } else {
                entries
                    .iter()
                    .position(|entry| same_key(&entry.cookie, &cookie))
            };
            if entries
                .iter()
                .enumerate()
                .any(|(index, entry)| Some(index) != existing && same_key(&entry.cookie, &cookie))
            {
                return Err("相同網域、路徑與名稱的 Cookie 已存在".into());
            }
            let entry = StoredCookie {
                id: existing
                    .map(|index| entries[index].id.clone())
                    .unwrap_or_else(|| Uuid::new_v4().to_string()),
                persistent: input.persistent,
                cookie,
            };
            if let Some(index) = existing {
                entries[index] = entry;
            } else {
                entries.push(entry);
            }
            Ok(())
        })
    }

    pub fn delete(&self, id: &str) -> Result<(), String> {
        self.update(|entries| {
            entries.retain(|entry| entry.id != id);
            Ok(())
        })
    }

    pub fn set_persistent(&self, id: &str, persistent: bool) -> Result<(), String> {
        self.update(|entries| {
            let entry = entries
                .iter_mut()
                .find(|entry| entry.id == id)
                .ok_or("Cookie 已不存在或已過期")?;
            entry.persistent = persistent;
            Ok(())
        })
    }

    pub fn clear(&self) -> Result<(), String> {
        let mut entries = self.lock()?;
        // 啟動時已略過的過期 Cookie 也必須從磁碟移除。
        self.persist(&[])?;
        entries.clear();
        Ok(())
    }

    fn receive(&self, cookie: Cookie<'static>) -> Result<Option<String>, String> {
        self.update(|entries| {
            let existing = entries
                .iter()
                .position(|entry| same_key(&entry.cookie, &cookie));
            if cookie.is_expired() {
                if let Some(index) = existing {
                    entries.remove(index);
                }
                return Ok(None);
            }
            let id = existing
                .map(|index| entries[index].id.clone())
                .unwrap_or_else(|| Uuid::new_v4().to_string());
            // 伺服器更新 Cookie 時沿用使用者的儲存選擇；新 Cookie 預設只留在記憶體。
            let entry = StoredCookie {
                id: id.clone(),
                persistent: existing.is_some_and(|index| entries[index].persistent),
                cookie,
            };
            if let Some(index) = existing {
                entries[index] = entry;
            } else {
                entries.push(entry);
            }
            Ok(Some(id))
        })
    }

    pub fn header(&self, ids: &HashSet<String>, url: &Url) -> Result<Option<HeaderValue>, String> {
        let entries = self.lock()?;
        let mut cookies: Vec<_> = entries
            .iter()
            .filter(|entry| ids.contains(&entry.id) && matches_url(&entry.cookie, url))
            .collect();
        cookies.sort_by_key(|entry| std::cmp::Reverse(entry.cookie.path.as_ref().len()));
        let value = cookies
            .iter()
            .map(|entry| format!("{}={}", entry.cookie.name(), entry.cookie.value()))
            .collect::<Vec<_>>()
            .join("; ");
        if value.is_empty() {
            Ok(None)
        } else {
            HeaderValue::from_str(&value)
                .map(Some)
                .map_err(|error| error.to_string())
        }
    }
}

fn parse_http_url(value: &str) -> Result<Url, String> {
    let url = Url::parse(value).map_err(|error| error.to_string())?;
    if !matches!(url.scheme(), "http" | "https") || url.host_str().is_none() {
        return Err("Cookie 僅支援 HTTP 或 HTTPS 網址".into());
    }
    Ok(url)
}

fn domain<'a>(cookie: &'a Cookie<'_>) -> &'a str {
    match &cookie.domain {
        CookieDomain::HostOnly(value) | CookieDomain::Suffix(value) => value,
        _ => "",
    }
}

fn same_key(left: &Cookie<'_>, right: &Cookie<'_>) -> bool {
    // CookiePath 另記錄是否明確指定 Path；識別同一筆 Cookie 時只比較實際路徑。
    domain(left) == domain(right)
        && left.path.as_ref() == right.path.as_ref()
        && left.name() == right.name()
}

fn matches_url(cookie: &Cookie<'_>, url: &Url) -> bool {
    !cookie.is_expired()
        && (!cookie.secure().unwrap_or(false) || url.scheme() == "https")
        && cookie.matches(url)
}

impl StoredCookie {
    fn summary(&self, url: Option<&Url>) -> CookieSummary {
        CookieSummary {
            id: self.id.clone(),
            name: self.cookie.name().to_string(),
            value: self.cookie.value().to_string(),
            domain: domain(&self.cookie).to_string(),
            path: self.cookie.path.as_ref().to_string(),
            secure: self.cookie.secure().unwrap_or(false),
            http_only: self.cookie.http_only().unwrap_or(false),
            host_only: matches!(self.cookie.domain, CookieDomain::HostOnly(_)),
            persistent: self.persistent,
            expires: match self.cookie.expires {
                CookieExpiration::AtUtc(value) => Some(value.unix_timestamp()),
                CookieExpiration::SessionEnd => None,
            },
            same_site: self.cookie.same_site().map(|value| value.to_string()),
            matches_url: url.is_none_or(|url| matches_url(&self.cookie, url)),
        }
    }
}

impl CookieInput {
    fn to_cookie(&self) -> Result<Cookie<'static>, String> {
        let forbidden = b"()<>@,;:\"/[]?={} \t";
        if self.name.is_empty()
            || !self
                .name
                .bytes()
                .all(|byte| byte.is_ascii_graphic() && byte != b'\\' && !forbidden.contains(&byte))
        {
            return Err("Cookie 名稱包含無效字元".into());
        }
        if !self.value.bytes().all(
            |byte| matches!(byte, 0x21 | 0x23..=0x2b | 0x2d..=0x3a | 0x3c..=0x5b | 0x5d..=0x7e),
        ) {
            return Err("Cookie 值包含無效字元，請先進行百分比編碼".into());
        }
        if !self.path.starts_with('/')
            || self
                .path
                .chars()
                .any(|character| character.is_control() || character == ';')
        {
            return Err("Cookie 路徑必須以 / 開頭且不可包含控制字元或分號".into());
        }
        let host = self.domain.trim().trim_start_matches('.').to_lowercase();
        if host.is_empty()
            || host.chars().any(|character| {
                character.is_whitespace() || matches!(character, '/' | '?' | '#' | '@' | '\\')
            })
        {
            return Err("請填寫有效網域，不包含通訊協定、連接埠或路徑".into());
        }
        let url = parse_http_url(&format!("https://{host}/"))?;
        if host.contains(':') && !(host.starts_with('[') && host.ends_with(']')) {
            return Err("Cookie 網域不可包含連接埠".into());
        }
        if url.port().is_some() || url.host_str().is_none() {
            return Err("Cookie 網域不可包含連接埠".into());
        }
        let mut raw = RawCookie::build((self.name.clone(), self.value.clone()))
            .path(self.path.clone())
            .secure(self.secure)
            .http_only(self.http_only);
        if !self.host_only {
            raw = raw.domain(url.host_str().unwrap().to_string());
        }
        if let Some(expires) = self.expires {
            let expires = time::OffsetDateTime::from_unix_timestamp(expires)
                .map_err(|error| error.to_string())?;
            if expires <= time::OffsetDateTime::now_utc() {
                return Err("Cookie 到期時間必須晚於現在".into());
            }
            raw = raw.expires(expires);
        }
        if let Some(same_site) = &self.same_site {
            let same_site = match same_site.as_str() {
                "Strict" => cookie::SameSite::Strict,
                "Lax" => cookie::SameSite::Lax,
                "None" if self.secure => cookie::SameSite::None,
                _ => return Err("SameSite 必須為 Strict、Lax 或搭配 Secure 的 None".into()),
            };
            raw = raw.same_site(same_site);
        }
        if (self.name.starts_with("__Secure-") && !self.secure)
            || (self.name.starts_with("__Host-")
                && (!self.secure || !self.host_only || self.path != "/"))
        {
            return Err("Cookie 前綴要求 Secure；__Host- 另要求僅限主機且路徑為 /".into());
        }
        Cookie::try_from_raw_cookie(&raw.build(), &url).map_err(|error| error.to_string())
    }
}

pub struct RequestCookieJar {
    manager: Arc<CookieManager>,
    allowed: Mutex<HashSet<String>>,
    error: Mutex<Option<String>>,
}

impl RequestCookieJar {
    pub fn new(manager: Arc<CookieManager>, ids: &[String]) -> Self {
        Self {
            manager,
            allowed: Mutex::new(ids.iter().cloned().collect()),
            error: Mutex::new(None),
        }
    }

    pub fn take_error(&self) -> Option<String> {
        self.error.lock().ok()?.take()
    }

    fn record_error(&self, error: String) {
        if let Ok(mut value) = self.error.lock() {
            *value = Some(error);
        }
    }
}

impl CookieStore for RequestCookieJar {
    fn set_cookies(&self, headers: &mut dyn Iterator<Item = &HeaderValue>, url: &Url) {
        for header in headers {
            let Some(cookie) = header
                .to_str()
                .ok()
                .and_then(|value| Cookie::parse(value.to_string(), url).ok())
            else {
                continue;
            };
            match self.manager.receive(cookie) {
                Ok(Some(id)) => {
                    // 只讓本次回應新取得的 Cookie 參與後續重新導向，不帶入其他未勾選項目。
                    if let Ok(mut allowed) = self.allowed.lock() {
                        allowed.insert(id);
                    }
                }
                Ok(None) => {}
                Err(error) => self.record_error(error),
            }
        }
    }

    fn cookies(&self, url: &Url) -> Option<HeaderValue> {
        let allowed = match self.allowed.lock() {
            Ok(allowed) => allowed,
            Err(error) => {
                self.record_error(error.to_string());
                return None;
            }
        };
        match self.manager.header(&allowed, url) {
            Ok(header) => header,
            Err(error) => {
                self.record_error(error);
                None
            }
        }
    }
}
