@echo off
echo 🚀 Iniciando Dashboard de Tracking...
echo.

REM Verificar si las dependencias están instaladas
if not exist "backend\node_modules" (
  echo 📦 Instalando dependencias...
  call npm run install-all
)

echo.
echo ✅ Sistema listo!
echo.
echo Iniciando servidores...
echo ================================================
echo 📊 Dashboard: http://localhost:3000
echo 🔌 API Backend: http://localhost:5000
echo ================================================
echo.

call npm run dev
