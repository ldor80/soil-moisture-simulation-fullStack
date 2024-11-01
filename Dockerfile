FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies first
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

EXPOSE 3001

# Start Next.js development server with specific host
CMD ["npm", "run", "dev", "--", "-p", "3001", "--hostname", "0.0.0.0"]
