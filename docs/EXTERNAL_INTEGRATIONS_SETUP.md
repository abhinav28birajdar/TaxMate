# TaxMate external integrations and real-time setup

This document lists the external services that TaxMate can connect to, the
environment variables they use, and the steps to configure each service for
local development and production.

## Integration status

| Service | Role in TaxMate | Status | Required when |
| --- | --- | --- | --- |
| Supabase | PostgreSQL database, authentication, storage, and Realtime | **Required** | Always |
| Resend | Verification, password-reset, and application emails | **Required for email** | Email features are enabled |
| Razorpay | Checkout, payment verification, and payment webhooks | **Required for payments** | Razorpay payments are enabled |
| Upstash Redis | Serverless Redis for rate limiting and caching | **Required for Redis features** | Rate limiting/cache is enabled |
| Supabase Realtime | Live database events and presence | **Recommended** | Live notifications/chat/presence are enabled |
| Sentry | Error monitoring | Optional | Error monitoring is enabled |
| Stripe | Alternative payment provider | Not currently wired as the primary flow | Only after Stripe routes are implemented |
| LiveKit | Video consultation | UI/dependency present; server credentials are not in `.env.local` | Video calling is enabled |
| PostHog | Product analytics | Dependency present; no project key is configured | Product analytics is enabled |

Do not create credentials for every service at once. Start with Supabase,
Resend, Razorpay, and Upstash. Add the optional services only when their
features are ready.

## 1. Configure local environment variables

1. Copy the example file:

   ```powershell
   Copy-Item .env.local .env.local.backup
   ```

   If `.env.local` does not exist, copy the repository's environment template
   instead.

2. Put the following values in `.env.local`. Replace placeholders locally;
   never commit real secrets:

   ```dotenv
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_MAINTENANCE_MODE=false
   NEXT_PUBLIC_MAINTENANCE_MESSAGE=We are performing scheduled maintenance.

   # Internal authentication
   JWT_SECRET=generate-a-random-value-at-least-32-characters-long
   BCRYPT_SALT_ROUNDS=12
   NEXTAUTH_SECRET=only-if-a-legacy-NextAuth-flow-is-used

   # Resend
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=TaxMate <noreply@your-verified-domain.com>

   # Razorpay
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=your_test_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

   # Upstash Redis
   UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
   ```

3. Generate `JWT_SECRET` with a password manager or a cryptographically secure
   generator. Do not use a short, memorable password.
4. Restart Next.js after changing `.env.local`:

   ```powershell
   npm run dev
   ```

`NEXT_PUBLIC_` values are included in the browser bundle. All other keys must
remain server-only. In particular, never expose
`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
`RESEND_API_KEY`, or `UPSTASH_REDIS_REST_TOKEN`.

## 2. Supabase: database, auth, storage, and real-time

### Create and connect the project

1. Create a project at <https://supabase.com/>.
2. Open **Project Settings -> API**.
3. Copy the **Project URL** to `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the **anon/public key** to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Copy the **service role key** to `SUPABASE_SERVICE_ROLE_KEY`. Store it only
   on the server.
6. Run the repository schema in the Supabase SQL Editor:
   `supabase/complete_schema.sql`.
7. Configure **Authentication -> URL Configuration**:
   - Local site URL: `http://localhost:3000`
   - Local redirect URL: `http://localhost:3000/auth/callback`
   - Production redirect URL:
     `https://YOUR_DOMAIN/auth/callback`
8. Create and configure the Storage buckets required by document uploads.
   Review their RLS/storage policies before using production data.
9. In **Database -> Replication**, enable Realtime for tables whose inserts,
   updates, or deletes must be delivered to connected clients. Do not enable it
   for sensitive tables unless the RLS policies are correct.

### Verify Supabase locally

With the app running, open:

```text
http://localhost:3000/api/health
```

Then register a test user, verify the email flow, sign in, upload a test
document, and confirm that the record and file appear in Supabase.

For real-time behavior, open two browser sessions using different test users
and verify that a notification, message, or presence change appears without a
full-page refresh. Realtime is delivered by Supabase; it is not a replacement
for server-side authorization.

## 3. Resend: transactional email

1. Create an account at <https://resend.com/>.
2. In **Domains**, add and verify the domain that will send TaxMate mail.
   Add the DNS records Resend provides.
3. Create an API key with the minimum permissions needed by the application.
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
5. Use a verified sender address. Do not use an unverified production domain.
6. Restart the app and test registration, email verification, password reset,
   and a notification email.

The application sends email from the server through
`POST /api/notifications/email`. If the API key is missing, email delivery
should be treated as unavailable; do not replace the key with a real secret in
client-side code.

For production, configure the Resend webhook/event settings if delivery,
bounce, or complaint tracking is required. Protect any webhook endpoint with
signature verification before processing events.

## 4. Razorpay: payments and webhooks

### Test mode

1. Create or sign in to a Razorpay account at <https://razorpay.com/>.
2. Switch the dashboard to **Test Mode**.
3. From **Account & Settings -> API Keys**, generate test keys.
4. Set:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` to the test Key ID.
   - `RAZORPAY_KEY_SECRET` to the test Key Secret.
5. In **Webhooks**, create a webhook with this URL:

   ```text
   https://YOUR_PUBLIC_DOMAIN/api/payments/webhook
   ```

   For local testing, expose port 3000 with a trusted HTTPS tunnel such as
   ngrok, then use the tunnel URL. Do not use an unencrypted public endpoint.
6. Subscribe to at least `payment.captured` and `payment.failed`.
7. Copy the webhook secret to `RAZORPAY_WEBHOOK_SECRET`.
8. Make a test payment and verify both the payment record and invoice status.

The webhook route validates the `x-razorpay-signature` header against the raw
request body. Keep the raw body unchanged until signature verification is
complete. Use separate test and live keys/secrets.

### Production

1. Complete Razorpay account/KYC requirements.
2. Switch to Live Mode and generate live API keys.
3. Set the live values only in the hosting provider's encrypted environment
   variables.
4. Register the production webhook URL and use a new production webhook secret.
5. Test a low-value or approved production transaction and confirm the
   `payment.captured` event updates the invoice.

Never put `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in a
`NEXT_PUBLIC_` variable.

## 5. Upstash Redis: rate limiting and cache

1. Create a Redis database at <https://upstash.com/>.
2. Select a region close to the deployed application.
3. Copy the database **REST URL** to `UPSTASH_REDIS_REST_URL`.
4. Copy the database **REST token** to `UPSTASH_REDIS_REST_TOKEN`.
5. Restart the app and exercise login, registration, and other rate-limited
   endpoints.
6. Monitor command volume and memory in the Upstash console.

Use separate databases or namespaces for development and production. If Redis
is unavailable, do not silently treat a protected endpoint as unlimited;
investigate the error and choose an explicit availability policy.

## 6. Optional monitoring and analytics

### Sentry

Sentry is referenced by the server error handler, but no Sentry DSN is present
in the checked-in environment template. To enable it:

1. Create a project at <https://sentry.io/>.
2. Add the DSN and any release/environment settings required by the existing
   Sentry setup.
3. Store the DSN in the hosting provider's environment configuration.
4. Trigger a controlled test error and verify the event in Sentry.

Do not send passwords, tokens, tax documents, or other sensitive personal data
as event context.

### PostHog

PostHog is installed, but no PostHog key or host is currently configured in
`.env.local`. Before enabling it, decide what tax/accounting data is allowed
to be collected, add the approved public project key and host, and verify that
personal or financial data is not included in event properties.

## 7. Optional services that need additional implementation

### Stripe

The repository contains Stripe-related dependencies and type declarations, but
the active payment implementation and webhook documented here use Razorpay.
Do not add Stripe keys and assume Stripe payments work. To add Stripe safely,
implement and test separate server-side order/payment routes, signature-
verified Stripe webhooks, idempotent payment updates, and a provider choice in
the payment domain model.

### LiveKit video

The meetings UI contains a LiveKit option and the package is installed, but
LiveKit server credentials are not part of the current environment template.
To enable video calls, create a LiveKit project at <https://livekit.io/>, add
server-side API key/secret and the public server URL, implement a server route
that creates short-lived room tokens after TaxMate authorization, and connect
the client with that token. Never issue a LiveKit API secret or unrestricted
room token to the browser.

## 8. Production deployment checklist

- Set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain.
- Add all required variables to the hosting provider, not to Git.
- Use production Supabase, Resend, Razorpay, and Upstash resources.
- Configure Supabase redirect URLs and storage/RLS policies for the final
  domain.
- Configure the Razorpay webhook against the final HTTPS URL.
- Confirm email DNS (SPF/DKIM/DMARC) and sender-domain verification.
- Confirm `/api/health` and a complete sign-in flow after deployment.
- Test document upload permissions with a client and a CA test account.
- Test payment success, payment failure, and duplicate webhook delivery.
- Rotate any credential that was accidentally logged, shared, or committed.
- Keep `.env.local` out of version control and review the deployment log for
  accidental secret output.

## 9. Quick troubleshooting

| Symptom | Check |
| --- | --- |
| Auth callback fails | Supabase redirect URLs and exact `NEXT_PUBLIC_APP_URL` |
| Emails do not arrive | Resend domain verification, sender address, API key, spam/bounce logs |
| Razorpay checkout does not open | Public Key ID, test/live mode, and browser console |
| Payment stays pending | Razorpay webhook URL, subscribed events, webhook secret, and server logs |
| Rate limiting fails | Upstash REST URL/token and whether the deployment can reach Upstash |
| Real-time updates do not appear | Supabase Realtime replication, RLS policies, channel/table subscription, and browser network logs |
| Production links point to localhost | `NEXT_PUBLIC_APP_URL` in the hosting environment and a fresh deployment |

