# Flujo de Autenticación

## Resumen

Google OAuth → NextAuth JWT → Gateway /auth/verify → Session con user_id + emailHash + isAdmin

## Flujo completo

1. Usuario clic "Iniciar con Google" → `signIn("google", { callbackUrl: "/chat" })`
2. Google OAuth consent → retorna `id_token`, `access_token`, `refresh_token`
3. NextAuth JWT callback (`lib/auth.ts`):
   - Almacena tokens en JWT
   - Llama `POST {GATEWAY_URL}/auth/verify` con `id_token`
   - Gateway retorna `user_id` (Google sub claim)
4. NextAuth session callback expone al client:
   - `session.user_id` — Google sub (opaco)
   - `session.id_token` — para Bearer auth
   - `session.emailHash` — SHA-256 del email (anónimo)
   - `session.isAdmin` — true si email es admin
   - `session.error` — "RefreshAccessTokenError" si falla refresh
5. Chat: cada request pasa por proxy `/api/chat`
6. Proxy verifica session server-side + agrega `X-API-Key`

## Token refresh

- Si el token expira en < 5 minutos, se renueva automáticamente
- Usa `https://oauth2.googleapis.com/token` con `refresh_token`
- Si falla → `session.error = "RefreshAccessTokenError"`

## Variables de entorno

| Variable | Propósito |
|----------|-----------|
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `NEXTAUTH_SECRET` | Firma del JWT |
| `NEXTAUTH_URL` | URL base para callbacks |
| `NEXT_AUTH_SESSION_MAX_AGE` | Duración sesión (default 300s) |

## Archivos clave

- `lib/auth.ts` — Config NextAuth, callbacks JWT/session, hashEmail, ADMIN_EMAIL
- `app/api/auth/[...nextauth]/route.ts` — Handler HTTP
- `app/(auth)/login/page.tsx` — UI de login
- `middleware.ts` — Pass-through (auth se verifica en API proxy)

Ver diagrama: [auth-flow.mmd](diagrams/mermaid/auth-flow.mmd)
