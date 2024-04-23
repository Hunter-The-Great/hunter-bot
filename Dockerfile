FROM oven/bun:latest as base

RUN mkdir -p /bot
WORKDIR /bot

COPY package.json .
COPY bun.lockb .
RUN bun install

COPY . .

RUN bun run db-gen
RUN bun run cmd
RUN bun run cmd-dev

CMD ["bun", "run", "start"]
