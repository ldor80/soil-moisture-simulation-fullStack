FROM node:14

WORKDIR /usr/src/app

# Install specific npm version and increase memory
RUN npm install -g npm@8.19.4 && \
    npm cache clean --force

# Copy package files
COPY package*.json ./

# Install dependencies with increased memory
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

EXPOSE 3001

# Start Next.js development server
CMD ["npm", "run", "dev"]
