@echo off
chcp 65001 >nul
title 惊堂录 · 启动器

echo ================================================
echo   惊堂录 · 沉香劫  —  AI 古风推理游戏
echo ================================================
echo.

:: 检查 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [错误] 未检测到 Node.js，请先安装：
  echo.
  echo   https://nodejs.org  （下载 LTS 版本，一路默认安装即可）
  echo.
  echo 安装完成后重新双击本文件启动游戏。
  echo.
  pause
  exit /b 1
)

:: 检查依赖是否安装（node_modules 是否存在）
cd /d "%~dp0"
if not exist "node_modules\" (
  echo [首次启动] 正在安装依赖，约需 1-2 分钟，请稍候...
  echo.
  call npm install
  if %errorlevel% neq 0 (
    echo.
    echo [错误] 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
  echo.
  echo 依赖安装完成！
  echo.
)

echo 正在启动游戏服务...
echo 浏览器将自动打开，若未打开请访问：http://localhost:5173
echo 关闭此窗口即可退出游戏。
echo.

:: 延迟 2 秒后打开浏览器，等待服务启动
start "" cmd /c "timeout /t 2 >nul && start http://localhost:5173"

:: 启动开发服务器
npm run dev
pause
