# Documentación Técnica — infovoto-web

Frontend Next.js 14 para InfoVoto Peru 2026 — chatbot electoral con Voti (pixel art cyber llama).

## Documentos

| Documento | Contenido |
|-----------|-----------|
| [architecture.md](architecture.md) | Stack, rutas, estructura de archivos, puertos |
| [auth-flow.md](auth-flow.md) | Google OAuth → NextAuth → Gateway → Session |
| [security.md](security.md) | CSP, CORS, rate limit (gateway), prompt injection, XSS |
| [environment.md](environment.md) | Variables de entorno, setup local, Docker override |
| [api-routes.md](api-routes.md) | 4 rutas proxy: /api/chat y /api/analytics/* (schemas, timeouts, errores) |
| [components.md](components.md) | 11 componentes React: props, uso, estados de Voti |
| [pages.md](pages.md) | Chat (state machine, errores, warnings) + Stats (admin dashboard) |
| [voti-sprite-system.md](voti-sprite-system.md) | Motor de animación, 13 sprites, pipeline de assets |
| [deployment.md](deployment.md) | Docker multi-stage, Cloud Run, Vercel, variables requeridas |
| [testing.md](testing.md) | Playwright E2E (auth, chat, visual regression) |
| [integration-overview.md](integration-overview.md) | Rol del web en el sistema, contratos con el gateway |

## Diagramas

Todos los diagramas viven flat en `diagrams/`. Fuentes `.mmd` versionadas en git.

| Diagrama | Tipo | Descripción |
|----------|:----:|-------------|
| [diagrams/auth-flow.mmd](diagrams/auth-flow.mmd) | sequenceDiagram | Google OAuth → NextAuth → Gateway → Session → Chat |
| [diagrams/chat-data-flow.mmd](diagrams/chat-data-flow.mmd) | sequenceDiagram | Flujo completo de un mensaje: UI → proxy → gateway → Gemini |
| [diagrams/chat-state-machine.mmd](diagrams/chat-state-machine.mmd) | stateDiagram-v2 | Máquina de estados del chat: loading, sending, errors |
| [diagrams/component-tree.mmd](diagrams/component-tree.mmd) | graph TD | Árbol de componentes React por página |
| [diagrams/docker-services.mmd](diagrams/docker-services.mmd) | graph LR | Servicios Docker, puertos y conexiones (incluye ChromaDB) |
| [diagrams/security-layers.mmd](diagrams/security-layers.mmd) | flowchart TD | 10 capas de seguridad: browser → proxy → gateway |
| [diagrams/sprite-pipeline.mmd](diagrams/sprite-pipeline.mmd) | flowchart LR | Pipeline de assets: Gemini → rembg → OpenCV → Aseprite → Web |
| [diagrams/stats-dashboard-flow.mmd](diagrams/stats-dashboard-flow.mmd) | sequenceDiagram | 3 fetches paralelos del dashboard admin |

### Renderizar diagramas (opcional)

Los `.mmd` se renderizan directamente en GitHub. Para generar PNG/SVG localmente:

```bash
# Instalar CLI (una vez)
npm install -g @mermaid-js/mermaid-cli

# Generar SVG de un diagrama
npx mmdc -i diagrams/auth-flow.mmd -o diagrams/auth-flow.svg

# Generar todos
for f in diagrams/*.mmd; do npx mmdc -i "$f" -o "${f%.mmd}.svg"; done
```

> Los PNG/SVG generados **no se commitean** — se regeneran desde los `.mmd` cuando se necesitan.

## Visión global del sistema

Para ver cómo el web se integra con gateway, MCP, scraper y bases de datos:

```
infovoto-infra/docs/technical/system-integration.md
infovoto-infra/docs/technical/diagrams/system-overview.mmd
```

## Quick Start

```bash
# 1. Instalar
npm install

# 2. Configurar
cp .env.local.example .env.local
# Llenar con credenciales de Google Cloud Console

# 3. Dev local
npm run dev          # localhost:3000

# 4. Docker (con gateway + todos los servicios)
cd ../infovoto-infra
make up              # Levanta todo en localhost:2300
```
