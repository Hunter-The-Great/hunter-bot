import * as Sentry from "@sentry/bun";

Sentry.init({
    dsn: process.env.SENTRY_DSN,
});

export const sentry = Sentry;
