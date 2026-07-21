# Auth email templates

Branded HTML layouts for Supabase Auth emails. Hosted Supabase does not load these files automatically — paste them into the dashboard.

## Confirm sign up

1. Open [Authentication → Email Templates](https://supabase.com/dashboard/project/_/auth/templates)
2. Select **Confirm sign up**
3. Subject: `Confirm your Crabr account`
4. Replace the body with the contents of `confirmation.html`
5. Save

## Reset password (optional)

Same page → **Reset password**

- Subject: `Reset your Crabr password`
- Body: `recovery.html`

## Redirect URLs

In [Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration), add:

- Site URL: your app origin (e.g. `http://localhost:5173` or production)
- Redirect URLs: `{origin}/sign-in` and `{origin}/reset-password`

Password reset emails send users to `/reset-password` to choose a new password.

## Notes

- Templates use Go template variables such as `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`, and `{{ .Data.full_name }}` (set at sign-up).
- Keep `{{ .ConfirmationURL }}` in the CTA `href` so verification works.
- After saving, sign up with a test email and confirm the message looks correct in your inbox.

## Signup 500: Error sending confirmation email

With Supabase’s **default** email provider and **Confirm email** on:

- Only emails belonging to your [organization team](https://supabase.com/dashboard/org/_/team) can receive mail
- Limit is about **2 emails per hour**
- Other addresses fail with `Error sending confirmation email` (HTTP 500)

The app bypasses that path: `POST /api/auth/signup` creates a confirmed user via the Admin API, then the client signs in. No confirmation email is sent until you configure custom SMTP.

**Production (real confirmation emails):** configure [custom SMTP](https://supabase.com/dashboard/project/_/auth/smtp), turn Confirm email on, and switch the client back to `supabase.auth.signUp` if you want the mailer flow again.

**Template check:** [Email Templates](https://supabase.com/dashboard/project/_/auth/templates) → **Confirm sign up** → paste `confirmation.html` → Save.
