# Base stage for dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Build stage
FROM base AS build
RUN npm install -g @nestjs/cli
RUN npm run build gateway
RUN npm run build auth
RUN npm run build users
RUN npm run build notifications
RUN npm run build logs

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
COPY --from=base /app/protos ./protos 
COPY --from=build /app/dist ./dist

# Robust entrypoint discovery to handle monorepo/libs structure variations
CMD ["sh", "-c", "find dist/apps/${APP_NAME} -name main.js -exec node {} \\;"]
