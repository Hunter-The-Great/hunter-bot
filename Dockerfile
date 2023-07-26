FROM node:latest

# Create the directory!
RUN mkdir -p /bot
WORKDIR /bot

# Copy and Install our bot
COPY package.json .
COPY package-lock.json .
RUN npm install

# Our precious bot
COPY . .

RUN npm run db-gen

# Start me!
CMD ["npm", "run", "start"]

