
const STYLE_ID = "lh-user-color-theme";

/**
 * 動態套用 LigHTTP 主題。
 *
 * @param cssContent 主題 CSS，null 表示恢復預設主題。
 */
export function applyColorTheme(cssContent: string | null): void {
    let styleElement = document.getElementById(
        STYLE_ID,
    ) as HTMLStyleElement | null;

    if (cssContent === null) {
        styleElement?.remove();
        return;
    }

    if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = STYLE_ID;
        styleElement.dataset.theme = "user";
        document.head.appendChild(styleElement);
    }

    styleElement.textContent = cssContent;
}
