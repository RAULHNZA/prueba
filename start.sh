#!/bin/bash

echo "🚀 Iniciando Dashboard de Tracking..."
echo ""

# Verificar si las dependencias están instaladas
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
  echo "📦 Instalando dependencias..."
  npm run install-all
fi

echo ""
echo "✅ Sistema listo!"
echo ""
echo "Iniciando servidores..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 API Backend: http://localhost:5000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
