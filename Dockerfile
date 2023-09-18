FROM oven/bun:latest


RUN apt update \
    && apt install -y curl
ARG NODE_VERSION=18
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
    && bash n $NODE_VERSION \
    && rm n \
    && npm install -g n

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
CMD ["bun", "run", "start"]

