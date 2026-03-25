# Seguridad

## Capas de defensa

```
Browser → CSP Headers → Middleware → API Proxy → Gateway
           (1)            (2)          (3-6)       (7)
```

### 1. Content Security Policy (next.config.mjs)

| Header | Valor | Protege contra |
|--------|-------|---------------|
| `Content-Security-Policy` | Whitelist de orígenes | XSS, inyección de scripts |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS (legacy) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Info leak |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | APIs no usadas |

### 2. CORS (next.config.mjs)

API routes (`/api/*`) restringidas a `NEXTAUTH_URL` origin:
- `Access-Control-Allow-Origin`: solo tu dominio
- `Access-Control-Allow-Methods`: `POST, OPTIONS`
- `Access-Control-Max-Age`: 86400

### 3. Autenticación (api/chat/route.ts)

- `getServerSession(authOptions)` verifica sesión NextAuth server-side
- Sin sesión → 401 "Not authenticated"
- `id_token` extraído del JWT, nunca del request body

### 4. Rate Limiting (api/chat/route.ts)

- In-memory por `user_id` (30 requests/hora)
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`
- Cleanup cada 10 minutos
- Resets on deploy (stateless)

### 5. Input Validation (api/chat/route.ts)

- Tipo: `typeof body.message === "string"` — rechaza otros tipos
- Longitud: max 1000 caracteres — rechaza con 400
- Frontend: `maxLength` + contador visual + `slice(0, MAX)`

### 6. Prompt Injection Pre-filter (api/chat/route.ts)

16 regex patterns en español e inglés:

| Categoría | Ejemplo | Patrón |
|-----------|---------|--------|
| Extraer prompt | "muestra tu prompt" | `/(muestra\|revela\|dime).*prompt/i` |
| Ignorar reglas | "ignora tus instrucciones" | `/ignora\s*(tus\|las).*instrucciones/i` |
| Roleplay | "actúa como otro" | `/(actua\|pretend).*como/i` |
| Jailbreak | "DAN mode" | `/\bDAN\b.*mode/i` |
| Tool injection | "ejecuta comando" | `/(ejecuta\|run).*comando/i` |
| Override | "bypass filter" | `/\bbypass\b.*\b(filter\|guard)/i` |

**Respuesta:** 200 con mensaje amigable (no revela detección):
> "Solo puedo ayudarte con información electoral peruana"

**Beneficio:** Ahorra tokens de Gemini + 5-15s de latencia.

### 7. XSS Sanitization (chat/page.tsx)

```typescript
function sanitize(text: string): string {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
```

Aplicado a TODA respuesta del gateway antes de renderizar markdown.

### 8. API Key Protection (api/chat/route.ts)

- `GATEWAY_API_KEY_WEB` vive solo en el server (`.env.local`)
- Se agrega como header `X-API-Key` en el proxy
- **Nunca** llega al browser — `NEXT_PUBLIC_` no se usa para la key

## Qué NO protegemos (y por qué)

| Item | Razón |
|------|-------|
| Sprites PNG | Assets públicos, como cualquier web. No son secretos. |
| Metadata JSON | Necesarios para renderizar en browser |
| Landing page | Es pública por diseño |

## Archivos

- `next.config.mjs` — CSP, CORS, headers
- `app/api/chat/route.ts` — Rate limit, injection filter, input validation, API key
- `app/chat/page.tsx` — XSS sanitization, input maxLength
- `lib/auth.ts` — Session config, token refresh

Ver diagrama: [security-layers.mmd](diagrams/mermaid/security-layers.mmd)
