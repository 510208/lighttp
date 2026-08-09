# 安裝完畢後執行（此時 Tauri 已經寫入強奪預設的註冊表，我們來動手修正）
!macro NSIS_HOOK_POSTINSTALL
  # 清除 Tauri 預設在 .txt 底下建立的強制關聯（不讓它當預設）
  DeleteRegValue HKCR ".txt" ""

  # 建立你自己的應用程式唯一識別碼 (ProgID)
  WriteRegStr HKCR "YourAppName.TxtFile" "" "你的應用程式名稱描述"
  WriteRegStr HKCR "YourAppName.TxtFile\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'

  # 將 ProgID 註冊到 OpenWithProgids（這樣就只會出現在右鍵備選清單）
  WriteRegStr HKCR ".txt\OpenWithProgids" "YourAppName.TxtFile" ""

  # 註冊到系統應用程式選單，確保出現在「開啟檔案」的可選清單中
  WriteRegStr HKCR "Applications\${MAINBINARYNAME}.exe\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'
  
  # 通知 Windows 系統重新整理檔案關聯快取
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend

# 卸載前執行：乾淨移除所有相關註冊表
!macro NSIS_HOOK_PREUNINSTALL
  DeleteRegValue HKCR ".txt\OpenWithProgids" "YourAppName.TxtFile"
  DeleteRegKey HKCR "YourAppName.TxtFile"
  DeleteRegKey HKCR "Applications\${MAINBINARYNAME}.exe"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend
