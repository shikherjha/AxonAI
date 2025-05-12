## changed the name of the dockerfile to Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install project dependencies
WORKDIR /app/project
RUN npm install

# Install backend dependencies if they're separate
WORKDIR /app/project/backend
RUN npm install

# Return to root for starting
WORKDIR /app

# Start using the script in the root package.json
CMD ["npm", "start"]