import * as Sentry from "@sentry/bun";

Sentry.init({
    dsn: process.env.DSN,
});

export const sentry = Sentry;
