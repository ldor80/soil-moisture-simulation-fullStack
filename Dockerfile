FROM node:14

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

EXPOSE 3001

# Start Next.js development server
CMD ["npm", "run", "dev"]
