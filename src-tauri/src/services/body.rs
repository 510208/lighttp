use crate::models::{BodyContent, FormDataFieldType};
use reqwest::header::{CONTENT_LENGTH, CONTENT_TYPE};
use reqwest::multipart::{Form, Part};
use reqwest::RequestBuilder;
use tokio::fs::{self, File};

async fn validate_file_path(path: Option<&str>) -> Result<&str, String> {
    let path = path
        .filter(|path| !path.trim().is_empty())
        .ok_or_else(|| "尚未選取上傳檔案，請先選擇檔案".to_string())?;
    let metadata = fs::metadata(path)
        .await
        .map_err(|error| format!("無法存取檔案「{}」：{}，請重新選取檔案", path, error))?;
    if !metadata.is_file() {
        return Err(format!("「{}」不是一般檔案，請重新選取檔案", path));
    }
    Ok(path)
}

pub async fn apply_body(
    mut request: RequestBuilder,
    body: BodyContent,
    has_content_type: bool,
    has_content_length: bool,
) -> Result<RequestBuilder, String> {
    match body.body_type.as_str() {
        "None" => {}
        "Raw" => request = request.body(body.content),
        "Form Data" => {
            let mut form = Form::new();
            // 使用有序欄位而非 Map，保留同名欄位及多檔上傳的順序。
            for field in body.form_data {
                if !field.enabled || field.key.is_empty() {
                    continue;
                }
                match field.field_type {
                    FormDataFieldType::Text => {
                        form = form.text(field.key, field.value);
                    }
                    FormDataFieldType::File => {
                        let path = validate_file_path(field.file_path.as_deref())
                            .await
                            .map_err(|error| format!("欄位「{}」：{}", field.key, error))?;
                        let part = Part::file(path).await.map_err(|error| {
                            format!("無法讀取欄位「{}」的檔案「{}」：{}", field.key, path, error)
                        })?;
                        form = form.part(field.key, part);
                    }
                }
            }
            request = request.multipart(form);
        }
        "URL Encoded" => {
            let fields: Vec<(String, String)> = body
                .url_encoded
                .into_iter()
                .filter(|field| field.enabled && !field.key.is_empty())
                .map(|field| (field.key, field.value))
                .collect();
            request = request.form(&fields);
        }
        "Binary" => {
            let path = validate_file_path(body.file_path.as_deref()).await?;
            let file = File::open(path)
                .await
                .map_err(|error| format!("無法讀取檔案「{}」：{}", path, error))?;
            let metadata = file
                .metadata()
                .await
                .map_err(|error| format!("無法讀取檔案資訊「{}」：{}", path, error))?;
            if !has_content_type {
                request = request.header(CONTENT_TYPE, "application/octet-stream");
            }
            if !has_content_length {
                request = request.header(CONTENT_LENGTH, metadata.len());
            }
            // 直接串流檔案，避免將整份二進位內容載入前端或記憶體。
            request = request.body(file);
        }
        _ => return Err(format!("不支援的 Body 類型: {}", body.body_type)),
    }
    Ok(request)
}
