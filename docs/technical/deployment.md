# Deployment — infovoto-web

## Docker (Local + Cloud Run)

**Archivo:** `Dockerfile` — multi-stage build con Node 20 Alpine.

```
Stage 1: deps     → npm ci (solo dependencias)
Stage 2: builder  → npm run build (Next.js standalone)
Stage 3: runner   → imagen mínima, usuario non-root nextjs:nodejs
```

### Build args requeridos

Los valores `NEXT_PUBLIC_*` se embeben en el bundle en build-time:

| Build arg | Default | Descripción |
|-----------|---------|-------------|
| `NEXT_PUBLIC_GATEWAY_URL` | `http://localhost:2080` | URL pública del gateway |
| `NEXT_PUBLIC_ASSETS_URL` | `""` | URL base para sprites/assets públicos |

### Levantar local con Docker Compose

```bash
cd infovoto-infra
make up      # levanta web + gateway + mcp + postgres + redis
# Web disponible en localhost:2300
```

Puerto interno: 3000. Puerto externo (host): 2300.

### Variables de entorno en runtime

A diferencia de `NEXT_PUBLIC_*`, estas se leen en servidor en cada request:

| Variable | Requerida | Descripción |
|----------|:---------:|-------------|
| `GOOGLE_CLIENT_ID` | ✅ | OAuth app ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | OAuth app secret |
| `NEXTAUTH_SECRET` | ✅ | JWT signing key (mín. 32 chars) |
| `NEXTAUTH_URL` | ✅ | URL base del web (ej: `https://infovoto.com`) |
| `GATEWAY_URL` | ✅ | URL interna al gateway (Docker: `http://gateway:8080`) |
| `GATEWAY_API_KEY_WEB` | ✅ | API key para el proxy (nunca `NEXT_PUBLIC_`) |
| `ADMIN_EMAIL` | ✅ | Email con acceso al dashboard `/stats` |
| `NEXT_AUTH_SESSION_MAX_AGE` | — | Duración sesión en segundos (default: 300) |

Ver detalle de todas las variables en [environment.md](environment.md).

---

## Cloud Run

### Deploy manual

```bash
# Build y push de la imagen
gcloud builds submit \
  --tag gcr.io/{PROJECT_ID}/infovoto-web \
  --build-arg NEXT_PUBLIC_GATEWAY_URL=https://infovoto-gateway-xxx.run.app \
  --build-arg NEXT_PUBLIC_ASSETS_URL=https://storage.googleapis.com/{bucket} \
  .

# Deploy al servicio
gcloud run deploy infovoto-web \
  --image gcr.io/{PROJECT_ID}/infovoto-web \
  --region us-central1 \
  --port 3000 \
  --set-secrets=GOOGLE_CLIENT_SECRET=google-client-secret:latest \
  --set-secrets=NEXTAUTH_SECRET=nextauth-secret:latest \
  --set-secrets=GATEWAY_API_KEY_WEB=api-key-web:latest \
  --set-env-vars=GATEWAY_URL=https://infovoto-gateway-xxx.run.app \
  --set-env-vars=NEXTAUTH_URL=https://infovoto.com \
  --set-env-vars=ADMIN_EMAIL=admin@example.com
```

### Secrets en GCP Secret Manager

Crear antes del deploy:
```bash
echo -n "gk_web_..." | gcloud secrets create api-key-web --data-file=-
echo -n "..." | gcloud secrets create nextauth-secret --data-file=-
echo -n "..." | gcloud secrets create google-client-secret --data-file=-
```

### Cloud Build trigger (CI/CD)

Cada push a `main` en `infovoto-web` dispara el trigger configurado en Cloud Build.
1 repo = 1 trigger (regla del proyecto).

---

## Vercel (alternativa)

Next.js 14 es compatible con Vercel sin configuración extra.

```bash
vercel --prod \
  -e GATEWAY_URL=https://infovoto-gateway-xxx.run.app \
  -e NEXTAUTH_URL=https://infovoto.vercel.app \
  -e GATEWAY_API_KEY_WEB=gk_web_...
```

**Nota:** `NEXT_PUBLIC_GATEWAY_URL` debe estar en Vercel como Environment Variable para que se embeba en el build.

---

## Health check

Next.js standalone responde en `/` — Cloud Run usa HTTP GET `/` como health probe por defecto.
