# Testing — infovoto-web

## Stack

| Herramienta | Uso |
|-------------|-----|
| **Playwright** | E2E: flujo completo en browser real |
| **Vitest** | Unit tests (configurado, sin tests aún) |

---

## Tests E2E (Playwright)

**Directorio:** `tests/`

| Archivo | Escenario |
|---------|-----------|
| `tests/auth.spec.ts` | Login con Google OAuth |
| `tests/chat.spec.ts` | Envío de mensajes y respuesta de Voti |
| `tests/visual.spec.ts` | Regresión visual (screenshots) |

### Correr tests

```bash
# Instalar Playwright browsers (primera vez)
npx playwright install

# Correr todos los E2E
npx playwright test

# Solo un spec
npx playwright test tests/chat.spec.ts

# Con UI interactivo
npx playwright test --ui

# Ver reporte HTML
npx playwright show-report
```

### Prerequisito: servicios corriendo

Los tests E2E requieren el web + gateway levantados:
```bash
cd ../infovoto-infra
make up    # levanta todo en localhost:2300

# En otra terminal:
npx playwright test
```

---

## auth.spec.ts — Flujo de login

Cubre:
- Renderizado del botón "Continuar con Google"
- Redirección a Google OAuth
- Retorno con sesión válida
- Redirección a `/chat` post-login

---

## chat.spec.ts — Flujo de chat

Cubre:
- Página de chat protegida (redirige a `/login` si no hay sesión)
- Input con límite de 1,000 caracteres
- Envío de mensaje y espera de respuesta
- Renderizado de fuentes (sources)
- Renderizado de warnings ámbar
- Mensaje de error cuando el gateway falla

---

## visual.spec.ts — Regresión visual

Screenshots comparativos para detectar cambios visuales no intencionados.

Cubre:
- Landing page completa
- Chat page en estado vacío (con sugerencias)
- Chat page con mensajes
- Stats page

Ver guía completa en `TEST_REDESIGN.md` (raíz del repo).

---

## Configuración

**Archivo:** `playwright.config.ts` (raíz del repo)

```typescript
// baseURL apunta al web local
baseURL: process.env.BASE_URL || "http://localhost:2300"
```

---

## Cobertura actual

| Área | Estado |
|------|--------|
| Auth flow (Google OAuth) | ✅ E2E |
| Chat — envío y respuesta | ✅ E2E |
| Chat — manejo de errores | ✅ E2E |
| Visual regression | ✅ Screenshots |
| Unit tests (lib/api.ts) | ⚠️ Pendiente |
| Unit tests (lib/auth.ts) | ⚠️ Pendiente |
| Unit tests (components) | ⚠️ Pendiente |
