import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

function openAboutWindow() {
  const aboutWindow = new WebviewWindow("about", {
    url: "/about", // 或是您的路由路徑
    title: "關於應用程式",
    width: 600,
    height: 500,
    resizable: false,
    maximizable: false,
    alwaysOnTop: true, // 讓它保持在最上層
    fullscreen: false,
  });

  return aboutWindow;
}

export { openAboutWindow };
