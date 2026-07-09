FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate client explicitly in case postinstall didn't
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Expose API port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
