FROM node:23
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
EXPOSE 3000
# Run migrations, then seed positions, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node server.js"]