echo " Iniciando base de datos con Docker Compose..."
cd /usr/local/contenedores/postgres
docker compose up -d
echo " Esperando que la base de datos inicie..."
sleep 5  # Ajusta según el tiempo de arranque de tu BD

echo "Base de datos arriba."

echo "ejecutando frontend"

cd /usr/local/proyectos/frontend/AnalisisNumericoAppFE

browser-sync start --server ./src --files "./src/**/*" --no-open
echo "abriendo vsCode"
code ./

cd /usr/local/idea-comunity/bin
./idea.sh
