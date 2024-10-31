FROM node:14

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build && \
    ls -la dist/ && \
    test -f dist/server.js || exit 1

EXPOSE 3000

# Use node directly instead of npm to get better error messages
CMD ["node", "dist/server.js"]
