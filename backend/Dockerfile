FROM node:22-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Expose API port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
