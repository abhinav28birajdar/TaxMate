# Environment Setup

This project uses Supabase for authentication, database access, and storage, plus a small set of external services for email, payments, and rate limiting.

## Variables

### `NEXT_PUBLIC_SUPABASE_URL`

#### Purpose
Supabase project URL used by browser and server clients.

#### Required?
Yes.

#### Client or Server?
Public.

#### How to obtain
Open your Supabase project, go to Project Settings, then API, and copy the Project URL.

#### Configuration
Place it in `.env.local` and in your deployment environment.

#### Security
Safe to expose publicly, but it must match your project exactly.

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Purpose
Supabase anonymous key used by the browser client and server-side SSR client.

#### Required?
Yes.

#### Client or Server?
Public.

#### How to obtain
Open Supabase Project Settings -> API and copy the anon/public key.

#### Configuration
Place it in `.env.local` and your hosting environment.

#### Security
Public by design, but it must still be treated as project-specific configuration.

### `SUPABASE_SERVICE_ROLE_KEY`

#### Purpose
Server-only Supabase key used for privileged database and auth operations.

#### Required?
Yes for server routes that create users, send admin queries, or access protected tables.

#### Client or Server?
Server-only.

#### How to obtain
Open Supabase Project Settings -> API and copy the service role key.

#### Configuration
Store only in server environments such as `.env.local` and deployment secrets.

#### Security
Never expose this key in the browser or client bundles.

### `NEXT_PUBLIC_APP_URL`

#### Purpose
Absolute public application base URL used in email links and redirects.

#### Required?
Yes.

#### Client or Server?
Public.

#### How to obtain
Use your local development URL during development and your production domain in deployment.

#### Configuration
Set in `.env.local` and deployment environment variables.

#### Security
Public value, but it must point to the correct canonical domain.

### `NEXT_PUBLIC_MAINTENANCE_MODE`

#### Purpose
Turns the maintenance banner / maintenance response behavior on or off.

#### Required?
No.

#### Client or Server?
Public.

#### How to obtain
Create the variable manually. Use `true` or `false`.

#### Configuration
Set in `.env.local` and deployment secrets if you want remote control.

#### Security
Public flag only.

### `NEXT_PUBLIC_MAINTENANCE_MESSAGE`

#### Purpose
Message shown when maintenance mode is enabled.

#### Required?
No.

#### Client or Server?
Public.

#### How to obtain
Create the message manually.

#### Configuration
Set in `.env.local` or deployment env vars.

#### Security
Public text.

### `JWT_SECRET`

#### Purpose
Used by internal token helpers and backend auth utilities.

#### Required?
Yes for the custom auth APIs and any JWT signing/verification.

#### Client or Server?
Server-only.

#### How to obtain
Generate a strong random string with at least 32 characters. Use your secrets manager or a local generator.

#### Configuration
Store in `.env.local` and deployment secrets.

#### Security
Never expose publicly.

### `BCRYPT_SALT_ROUNDS`

#### Purpose
Controls password hashing cost for server-side password utilities.

#### Required?
No.

#### Client or Server?
Server-only.

#### How to obtain
Choose a value between 10 and 15. Default is `12`.

#### Configuration
Set in `.env.local` and deployment secrets if you want to override the default.

#### Security
Server-side only.

### `NEXTAUTH_SECRET`

#### Purpose
Used by legacy NextAuth middleware / auth helpers if those routes are still active.

#### Required?
No, unless you use the legacy NextAuth path.

#### Client or Server?
Server-only.

#### How to obtain
Generate a strong random string.

#### Configuration
Store in `.env.local` only if the legacy NextAuth code path is enabled.

#### Security
Never expose publicly.

### `RESEND_API_KEY`

#### Purpose
Sends transactional email such as verification and notifications.

#### Required?
Yes for email features.

#### Client or Server?
Server-only.

#### How to obtain
Create a Resend account, verify your domain, then generate an API key from the dashboard.

#### Configuration
Store in `.env.local` and deployment secrets.

#### Security
Never expose publicly.

### `RESEND_FROM_EMAIL`

#### Purpose
Default sender address for outbound email.

#### Required?
No, but recommended.

#### Client or Server?
Server-only.

#### How to obtain
Use a verified email address or domain on your email provider.

#### Configuration
Store in `.env.local` and deployment secrets.

#### Security
Do not expose secrets here; this is just a sender address.

### `NEXT_PUBLIC_RAZORPAY_KEY_ID`

#### Purpose
Public Razorpay key used by the client payment button.

#### Required?
Yes if Razorpay checkout is used.

#### Client or Server?
Public.

#### How to obtain
Open the Razorpay dashboard, create or open a live/test mode account, and copy the Key ID.

#### Configuration
Store in `.env.local` and deployment environment variables.

#### Security
Public key only. Do not confuse it with the secret key.

### `RAZORPAY_KEY_SECRET`

#### Purpose
Used by server-side payment verification.

#### Required?
Yes if Razorpay payments are enabled.

#### Client or Server?
Server-only.

#### How to obtain
Open the Razorpay dashboard and copy the Key Secret for your account mode.

#### Configuration
Store in `.env.local` and deployment secrets.

#### Security
Never expose publicly.

### `RAZORPAY_WEBHOOK_SECRET`

#### Purpose
Verifies incoming Razorpay webhook signatures.

#### Required?
Yes for secure webhook handling.

#### Client or Server?
Server-only.

#### How to obtain
Create a webhook in Razorpay and copy the webhook secret it provides.

#### Configuration
Store in `.env.local` and deployment secrets.

#### Security
Never expose publicly.

### `UPSTASH_REDIS_REST_URL`

#### Purpose
Used for Redis-backed caching and rate limiting.

#### Required?
Yes if Redis features are enabled.

#### Client or Server?
Server-only.

#### How to obtain
Create an Upstash Redis database and copy the REST URL from the dashboard.

#### Configuration
Store in `.env.local` and deployment secrets.

#### Security
Never expose publicly.

### `UPSTASH_REDIS_REST_TOKEN`

#### Purpose
Auth token for the Upstash Redis REST API.

#### Required?
Yes if Redis features are enabled.

#### Client or Server?
Server-only.

#### How to obtain
Create an Upstash Redis database and copy the REST token from the dashboard.

#### Configuration
Store in `.env.local` and deployment secrets.

#### Security
Never expose publicly.

## Supabase Setup Checklist

1. Create a Supabase project.
2. Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Run `supabase/schema.sql` in the SQL editor.
4. Enable the relevant auth providers in Supabase Auth.
5. Configure redirect URLs for `/auth/callback`.
6. Confirm RLS is enabled for the tables used by the app.
7. Configure storage buckets and policies if file uploads are enabled.
8. Add the variables above to your deployment environment.

## Notes

- Never commit real secrets to the repository.
- Keep public client variables prefixed with `NEXT_PUBLIC_`.
- Keep server-only credentials out of client bundles.
