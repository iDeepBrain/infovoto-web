# infovoto-web

Next.js 14 + NextAuth.js + TailwindCSS frontend for InfoVoto Peru 2026.

## Commands
```bash
npm install
cp .env.local.example .env.local   # fill in Google credentials
npm run dev    # localhost:3000 (docker: localhost:2300)
npm run build
npm run lint
```

## Structure
- `app/page.tsx` — public landing
- `app/(auth)/login/page.tsx` — Google Login via NextAuth
- `app/chat/page.tsx` — protected chat UI
- `app/api/auth/[...nextauth]/` — NextAuth handler
- `lib/auth.ts` — NextAuth config + calls gateway /auth/verify
- `lib/api.ts` — typed client for gateway /api/chat
- `middleware.ts` — protects /chat/* (redirects to /login)

## Auth Flow
1. User clicks "Continuar con Google"
2. NextAuth redirects to Google OAuth → returns id_token
3. `lib/auth.ts` sends id_token to gateway `POST /auth/verify`
4. Gateway returns user_id (Google sub) → stored in NextAuth JWT
5. Each /api/chat request includes id_token in Authorization header

## Required Env Vars
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_GATEWAY_URL`

## Key Note
- Port: 2300 (docker-compose maps 2300→3000)
