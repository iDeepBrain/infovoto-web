# Variables de Entorno

## .env.local (infovoto-web)

| Variable | Propósito | Público | Ejemplo |
|----------|-----------|---------|---------|
| `GOOGLE_CLIENT_ID` | OAuth client | No | `630531...googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth secret | No | `GOCSPX-...` |
| `NEXTAUTH_SECRET` | Firma JWT | No | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL callbacks | No | `http://localhost:3000` (dev) / `http://localhost:2300` (docker) |
| `NEXT_PUBLIC_GATEWAY_URL` | Gateway (browser) | Sí | `http://localhost:2080` |
| `GATEWAY_URL` | Gateway (server proxy) | No | `http://localhost:2080` (dev) / `http://gateway:8080` (docker) |
| `GATEWAY_API_KEY_WEB` | API key para gateway | No | `gk_web_...` |
| `NEXT_AUTH_SESSION_MAX_AGE` | Duración sesión (s) | No | `300` (5 min) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics | Sí | `G-XXXXXXXXXX` |

## .env.secrets (raíz del proyecto)

| Variable | Servicios | Propósito |
|----------|-----------|-----------|
| `GEMINI_API_KEY` | Gateway | API de Gemini |
| `GOOGLE_CLIENT_ID` | Web | OAuth |
| `GOOGLE_CLIENT_SECRET` | Web | OAuth |
| `NEXTAUTH_SECRET` | Web | JWT signing |
| `GATEWAY_API_KEY_WEB` | Web → Gateway | Auth web proxy |
| `GATEWAY_API_KEY_GRADIO` | Gradio → Gateway | Auth Gradio |
| `GATEWAY_API_KEY_ADMIN` | Admin → Gateway | Auth admin |
| `SUPABASE_*` | Gateway (prod) | DB producción |

## .env.config (raíz del proyecto)

| Variable | Propósito |
|----------|-----------|
| `ENVIRONMENT` | development / production |
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis connection |
| `MCP_URLS` | URLs de los MCPs |
| `GEMINI_MODEL` | Modelo de Gemini |

## Regla de prefijos

- `NEXT_PUBLIC_*` → compilado en el JS del browser (visible al usuario)
- Sin prefijo → solo disponible en server-side (API routes, middleware)
- **NUNCA** poner secrets con prefijo `NEXT_PUBLIC_`

## Setup local

```bash
# Desde infovoto-web/
cp .env.local.example .env.local
# Llenar con valores reales de Google Cloud Console

# Desde raíz del proyecto/
cp .env.secrets.example .env.secrets
cp .env.config.example .env.config
```

## Docker override

En `docker-compose.yml`, el servicio `web` sobreescribe:
- `NEXTAUTH_URL=http://localhost:2300` (puerto Docker)
- `GATEWAY_URL=http://gateway:8080` (red interna Docker)
- `HOSTNAME=0.0.0.0`
