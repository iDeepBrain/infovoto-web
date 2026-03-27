# Integración con el Sistema — infovoto-web

El web es la **capa de presentación** del sistema InfoVoto. No procesa lógica electoral ni llama a fuentes de datos directamente — todo pasa por el gateway.

---

## Rol del web en el sistema

```
Usuario
  │
  ▼
infovoto-web (Next.js)
  │  Landing, Login, Chat, Stats
  │  Agrega API key server-side
  │  Valida sesión (NextAuth)
  │
  ▼
infovoto-gateway (FastAPI)          ← Toda la lógica de negocio vive aquí
  │  Auth (Google OAuth, API keys)
  │  Rate limiting (Redis)
  │  Agente Gemini
  │
  ├──▶ infovoto-mcp (5 herramientas)
  │      perfiles, planes, logística,
  │      fiscalización, financiamiento
  │
  └──▶ PostgreSQL + Redis + ChromaDB
```

---

## Contratos entre web y gateway

### Chat (`POST /api/chat`)

El web envía:
```json
{ "message": "¿Quiénes postulan?" }
```
Con headers: `Authorization: Bearer {id_token}`, `X-API-Key: {key}`, `X-Real-IP`.

El gateway responde:
```json
{
  "reply": "Los candidatos confirmados son...",
  "sources": [{ "name": "JNE", "url": "...", "data_type": "oficial" }],
  "warnings": [{ "type": "ia_interpretacion", "message": "..." }],
  "session_id": "abc123",
  "cached": false
}
```

### Analytics (`GET /analytics/*`)

El web actúa como proxy autenticado. Solo el email `ADMIN_EMAIL` puede ver `/stats`.

### Auth (`POST /auth/verify`)

Al hacer login, NextAuth llama al gateway con el `id_token` de Google para obtener el `user_id` (Google sub). Este flujo está documentado en [auth-flow.md](auth-flow.md).

---

## Qué NO hace el web

| Responsabilidad | Quién la tiene |
|----------------|----------------|
| Rate limiting | Gateway (Redis sliding window) |
| Lógica del agente Gemini | Gateway + infovoto-mcp |
| Acceso a base de datos | Gateway |
| Indexación de candidatos/propuestas | infovoto-scraper |
| Vectores/embeddings | infovoto-mcp (ChromaDB) |

---

## Diagrama completo del sistema

El diagrama de integración global (todos los servicios, flujos de red, Cloud Run) vive en:

```
infovoto-infra/docs/technical/system-integration.md
infovoto-infra/docs/technical/diagrams/system-overview.mmd
```

El docker-compose que orquesta todos los servicios localmente está en `infovoto-infra/`.

---

## Puntos de fallo y degradación

| Fallo | Comportamiento del web |
|-------|----------------------|
| Gateway no disponible | Chat muestra `502 Gateway unavailable` |
| Gateway timeout >20s | Chat muestra `504 Gateway timeout` |
| Redis down (rate limit) | Gateway debería permitir paso (no fallar cerrado) |
| Google OAuth caído | Login no funciona — chat tampoco (sin sesión) |
| infovoto-mcp down | Gateway responde sin herramientas MCP (respuesta degradada) |
