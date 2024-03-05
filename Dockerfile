FROM node:latest

# Create the directory!
RUN mkdir -p /bot
WORKDIR /bot

# Copy and Install our bot
COPY package.json .
COPY bun.lockb .
RUN bun install

# Our precious bot
COPY . .

RUN bun run db-gen

# Start me!
CMD ["npm", "run", "start"]

