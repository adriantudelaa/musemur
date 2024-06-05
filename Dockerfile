# Dockerfile

FROM node:18-alpine

WORKDIR /app

# Copiar solo los archivos de dependencias primero para aprovechar el caching
COPY package*.json ./

# Instalar solo las dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código de la aplicación
COPY . .

# Comando para iniciar la aplicación
CMD ["node", "src/index.js"]
