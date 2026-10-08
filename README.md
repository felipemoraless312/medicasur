# Medicasur

Plataforma clínica del **Dr. Francisco Antonio Ramos Narváez** (Cirugía General · Gastroenterología):

- **Sitio público** (`/`, `/servicios`, `/agendar`): información del médico, catálogo de servicios y solicitud de citas.
- **Portal del paciente** (`/portal`): citas, consultas, estudios, documentos y datos personales.
- **Sistema clínico** (`/sistema`): agenda, expediente clínico (NOM-004 / NOM-024), urgencias, hospitalización, quirófano, farmacia, inventario y equipos médicos.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm run build      # compilación de producción
```

## Estructura

```
src/
├── app/                  Rutas. Solo páginas, layouts y componentes propios de cada ruta.
│   ├── (public)/         Sitio público
│   ├── (portal)/portal/  Portal del paciente
│   ├── (staff)/sistema/  Sistema clínico
│   ├── globals.css       Sistema de diseño (tokens de color, tipografía, radios)
│   └── layout.tsx        Layout raíz: fuentes, metadatos e íconos
├── components/           UI compartida, sin lógica de negocio
│   ├── ui/               Botones, campos, tarjetas, diálogos, listas, badges…
│   ├── layout/           Estructuras de página (inicio de sesión)
│   ├── charts/           Gráficas e indicadores
│   ├── brand/            Logotipos
│   └── motion/           Animaciones
├── modules/              Un módulo por dominio de negocio
│   ├── appointments/     Citas y agenda
│   ├── patients/         Expediente clínico
│   ├── inventory/        Inventario y farmacia
│   ├── equipment/        Equipos médicos y tecnovigilancia
│   ├── hospital/         Urgencias, hospitalización y quirófano
│   ├── auth/             Sesión y permisos por rol
│   ├── audit/            Bitácora de auditoría
│   ├── staff/            Personal
│   └── catalogs/         Catálogos (CIE-10, clínicos)
├── server/               Infraestructura del servidor (almacenamiento, utilidades de formularios)
├── config/               Contenido institucional: clínica, servicios, plataforma
├── lib/                  Utilidades generales (fechas, formato, clases CSS)
└── proxy.ts              Redirección optimista al inicio de sesión
public/                   Imágenes e íconos
```

### Capas de cada módulo

Cada módulo de `src/modules/<dominio>/` sigue las mismas capas. Solo se crean las que el módulo necesita.

| Archivo | Responsabilidad | Quién lo importa |
| --- | --- | --- |
| `types.ts` | Tipos y catálogos del dominio (estados, etiquetas) | Cualquiera |
| `repository.ts` | Acceso crudo a los datos, **sin** autorización (`server-only`) | Solo `data.ts`, `actions.ts` y `auth/` |
| `data.ts` | Lecturas: verifica sesión y permiso antes de consultar (`server-only`) | Páginas (Server Components) |
| `actions.ts` | Escrituras (Server Actions): valida, autoriza, guarda y audita | Formularios |
| `*-rules.ts`, `rules.ts`, `risk.ts` | Reglas de negocio puras, sin acceso a datos | Cualquiera |
| `components/` | Componentes propios del dominio | Páginas |

### Reglas para mantener la escalabilidad

1. **Las páginas no acceden a datos directamente**: llaman a `modules/*/data.ts` (lectura) o `modules/*/actions.ts` (escritura).
2. **`repository.ts` es el único punto que toca el almacenamiento.** Hoy usa `src/server/memory.ts` (datos de demostración en memoria); al conectar la base de datos solo cambian los repositorios, no sus funciones públicas.
3. **Toda lectura o escritura de datos clínicos pasa por `auth/session.ts`** (`requireStaff` / `requirePatient`) y se registra en la bitácora.
4. **Solo `data.ts`, `actions.ts` y `auth/` importan un `repository.ts`** (del propio módulo o de otro, p. ej. una acción de citas que consulta al paciente). Nunca las páginas ni los componentes.
5. **`components/ui` no conoce el negocio**; lo específico de un dominio vive en `modules/<dominio>/components`.
6. **Componentes usados por una sola ruta** van en su carpeta `_components` junto a esa ruta.
7. **Colores, tipografía y radios salen de los tokens** de `src/app/globals.css` (color de marca: azul marino `#005192`).

## Backend (siguiente fase)

- Sustituir `src/server/memory.ts` por la conexión a la base de datos (p. ej. `src/server/db/`) y reescribir cada `repository.ts` sobre ella.
- Sustituir el inicio de sesión de demostración (`modules/auth`) por autenticación real con segundo factor.
- Las rutas de API o webhooks irán en `src/app/api/`.
