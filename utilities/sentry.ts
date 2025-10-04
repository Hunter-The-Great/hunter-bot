import * as Sentry from "@sentry/node";

try {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: true,
  });
} catch (err) {
  console.error("Sentry failed to initialize: ", err);
}

export const sentry = Sentry;
