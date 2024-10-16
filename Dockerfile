FROM ubuntu:22.04

# > 1.a -- Install various essential dependencies
RUN apt-get update && apt-get install -y curl gnupg zip unzip

# > 1.b Install NodeJS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# > 1.c Install BunJS
ENV BUN_INSTALL=$HOME/bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH=$PATH:$HOME/bun/bin


RUN mkdir -p /bot
WORKDIR /bot

COPY package.json .
COPY bun.lockb .
RUN bun install

COPY . .

RUN bun run db-gen && bun run db-push

CMD ["bun", "run", "start"]

