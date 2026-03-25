# Documentación Técnica — infovoto-web

Frontend Next.js 14 para InfoVoto Peru 2026 — chatbot electoral con Voti (pixel art cyber llama).

## Documentos

| Documento | Contenido |
|-----------|-----------|
| [architecture.md](architecture.md) | Stack, rutas, estructura de archivos, puertos |
| [auth-flow.md](auth-flow.md) | Google OAuth → NextAuth → Gateway → Session |
| [security.md](security.md) | CSP, CORS, rate limit, prompt injection, XSS |
| [voti-sprite-system.md](voti-sprite-system.md) | Motor de animación, sprites, pipeline de assets |
| [environment.md](environment.md) | Variables de entorno, setup local, Docker override |

## Diagramas (Mermaid)

| Diagrama | Descripción |
|----------|-------------|
| [auth-flow.mmd](diagrams/mermaid/auth-flow.mmd) | Secuencia completa de autenticación |
| [security-layers.mmd](diagrams/mermaid/security-layers.mmd) | 7 capas de seguridad (flowchart) |
| [sprite-pipeline.mmd](diagrams/mermaid/sprite-pipeline.mmd) | Gemini → rembg → OpenCV → Aseprite → Web |
| [component-tree.mmd](diagrams/mermaid/component-tree.mmd) | Árbol de componentes React |
| [chat-data-flow.mmd](diagrams/mermaid/chat-data-flow.mmd) | Flujo de datos del chat (secuencia) |
| [docker-services.mmd](diagrams/mermaid/docker-services.mmd) | Servicios Docker y conexiones |

## Quick Start

```bash
# 1. Instalar
npm install

# 2. Configurar
cp .env.local.example .env.local
# Llenar con credenciales de Google Cloud Console

# 3. Dev local
npm run dev          # localhost:3000

# 4. Docker (con gateway)
cd ../infovoto-infra
make up              # Levanta todo en localhost:2300
```
