# Base stage for dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Build stage - Use tsc directly with standard outDir
FROM base AS build
RUN npx tsc -p apps/gateway/tsconfig.app.json
RUN npx tsc -p apps/auth/tsconfig.app.json
RUN npx tsc -p apps/users/tsconfig.app.json
RUN npx tsc -p apps/notifications/tsconfig.app.json

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
