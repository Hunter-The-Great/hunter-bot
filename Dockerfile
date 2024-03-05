FROM oven/bun:1 as base

RUN mkdir -p /bot
WORKDIR /bot

COPY package.json .
COPY bun.lockb .
RUN bun install

COPY . .

RUN bun run db-gen

CMD ["bun", "run", "start"]

