# Portfolio Daniel Españadero 2026 — Plan estratégico, técnico y SEO

## 1. Objetivo del proyecto

Crear desde cero un nuevo portfolio profesional en **AstroJS**, con foco en diseño, rendimiento, posicionamiento SEO y una narrativa profesional más senior.

El portfolio anterior en React/Vite se utilizará únicamente como referencia de contenido, no como base de migración.

### Objetivo principal

Posicionar a Daniel Españadero como:

> Backend Software Engineer especializado en Java, Spring Boot, arquitectura backend e IA aplicada, con autoridad diferencial gracias a su libro, canal de YouTube y contenido educativo.

### Objetivos secundarios

- Mejorar percepción visual y profesional respecto al portfolio anterior.
- Reducir ruido técnico: menos listado de tecnologías, más especialización.
- Destacar experiencia profesional actualizada, incluyendo Optimissa desde julio de 2025.
- Convertir libro y YouTube en activos principales de autoridad, no en secciones secundarias.
- Optimizar SEO técnico y semántico para búsquedas relacionadas con Java, Spring Boot, IA y backend.
- Mantener una arquitectura simple, rápida y mantenible.

---

## 2. Diagnóstico del portfolio anterior

El portfolio anterior está construido con:

- React 18
- Vite
- TypeScript
- styled-components
- i18next
- react-router-dom
- vanta
- use-sound
- axios

### Puntos positivos detectados

- Ya comunica perfil backend.
- Incluye tecnologías relevantes como Java, Spring Boot, MySQL, Docker y AWS.
- Muestra experiencia profesional real.
- Incluye elementos diferenciales: libro, YouTube, cursos y contenido técnico.
- Tiene internacionalización español/inglés.

### Problemas detectados

#### 2.1. Diseño visual envejecido

El diseño actual se percibe más cercano a un portfolio junior/2021-2022:

- Demasiadas cards de skills.
- Exceso de iconografía técnica.
- Jerarquía visual plana.
- Secciones muy verticales y poco editoriales.
- Uso abundante de emojis en títulos.
- Falta de narrativa visual senior.

#### 2.2. Posicionamiento técnico demasiado amplio

El listado actual incluye demasiadas tecnologías:

- Java
- Spring Boot
- C
- C++
- Linux
- Bash
- Docker
- JavaScript
- TypeScript
- NodeJS
- Express
- Angular
- React
- MySQL
- MongoDB
- HTML5
- CSS3
- AWS

Esto comunica amplitud, pero diluye la propuesta profesional. Para un perfil senior o semi-senior especializado, el portfolio debe vender foco, no inventario.

#### 2.3. Experiencia profesional desactualizada

El portfolio anterior conserva:

- Mytic Innova como experiencia actual.
- Malt como freelance anterior.

Debe incorporarse:

- **Optimissa — desde julio de 2025**.

#### 2.4. Contacto inseguro en implementación previa

El portfolio anterior intentaba enviar emails con Resend desde frontend usando variables `VITE_*`. Eso implica riesgo de exposición de API key.

En el nuevo portfolio, Resend se usará únicamente desde un endpoint server-side en Astro/Cloudflare Pages Functions.

---

## 3. Posicionamiento profesional 2026

### Mensaje central

Propuesta recomendada:

> Construyo backends robustos con Java, Spring Boot e IA aplicada.

Alternativa más formal:

> Backend Software Engineer especializado en Java, Spring Boot, arquitectura backend e integración de IA en sistemas reales.

Alternativa más orientada a autoridad:

> Ingeniero backend especializado en Java/Spring Boot, arquitectura e IA aplicada. También enseño programación a una comunidad técnica a través de YouTube y mi libro.

### Atributos de marca personal

- Backend serio.
- Stack enterprise.
- Arquitectura limpia.
- IA aplicada, no hype vacío.
- Capacidad de comunicación técnica.
- Perfil con comunidad, libro y contenido educativo.

### Qué NO comunicar

- “Sé muchas tecnologías”.
- “También hago frontend, backend, móvil, IA, DevOps, diseño y lo que haga falta”.
- “Portfolio genérico de desarrollador”.

El mensaje debe ser concreto: **Java + Spring Boot + Arquitectura + IA + divulgación técnica**.

---

## 4. Stack técnico del nuevo portfolio

### Framework principal

- **AstroJS**

Motivos:

- Excelente rendimiento para sitios de contenido.
- HTML estático por defecto.
- Menor JavaScript en cliente.
- Muy buen encaje con SEO.
- Permite endpoints server-side cuando se necesiten.
- Permite añadir islands si en el futuro hace falta interactividad.

### Lenguaje

- TypeScript

### Estilos

Opciones recomendadas:

#### Opción A — CSS global + CSS Modules

Pros:
- Simple.
- Sin dependencia extra.
- Muy mantenible en un portfolio.
- Máximo control visual.

Contras:
- Requiere disciplina de naming y tokens.

#### Opción B — Tailwind CSS

Pros:
- Velocidad de desarrollo.
- Buen sistema de diseño utility-first.
- Fácil responsive.

Contras:
- Puede ensuciar markup si no se controla.
- Menos expresivo para un diseño editorial fino si se usa sin criterio.

### Recomendación

Usar **CSS bien estructurado con variables/tokens**, salvo que se decida priorizar velocidad con Tailwind.

Para este portfolio, el diseño importa mucho. Conviene tener control visual fino.

### Deploy

- **Cloudflare Pages** en plan gratuito.
- Dominio comprado en Hostinger.
- DNS recomendado gestionado por Cloudflare.

### Contacto

- **Resend** para envío de emails.
- Endpoint server-side en Astro.
- Cloudflare Pages Functions para ejecutar `/api/contact`.

---

## 5. Arquitectura técnica propuesta

```txt
portfolio-dani-2026/
├── public/
│   ├── images/
│   ├── favicon.svg
│   ├── robots.txt
│   └── og/
│       └── default-og-image.png
├── src/
│   ├── components/
│   │   ├── seo/
│   │   │   ├── SEO.astro
│   │   │   └── JsonLd.astro
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── Section.astro
│   │   ├── home/
│   │   │   ├── Hero.astro
│   │   │   ├── Expertise.astro
│   │   │   ├── ExperienceTimeline.astro
│   │   │   ├── Projects.astro
│   │   │   ├── Authority.astro
│   │   │   └── Contact.astro
│   │   └── ui/
│   │       ├── Button.astro
│   │       ├── Card.astro
│   │       └── Badge.astro
│   ├── data/
│   │   ├── profile.ts
│   │   ├── skills.ts
│   │   ├── experience.ts
│   │   ├── projects.ts
│   │   └── seo.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── libro.astro
│   │   ├── youtube.astro
│   │   ├── proyectos.astro
│   │   └── api/
│   │       └── contact.ts
│   └── styles/
│       ├── global.css
│       ├── tokens.css
│       └── utilities.css
├── astro.config.mjs
├── package.json
└── wrangler.jsonc
```

### Principios de arquitectura

- Contenido separado en `src/data`.
- Componentes pequeños y semánticos.
- Layout base único.
- SEO centralizado.
- Nada de lógica innecesaria en cliente.
- JavaScript en navegador solo cuando aporte valor real.

---

## 6. Estructura de contenido recomendada

### 6.1. Home

La home debe funcionar como landing principal y página SEO más importante.

#### Secciones recomendadas

1. Hero
2. Especialización técnica
3. Experiencia profesional
4. Proyectos/contenido técnico destacado
5. Libro y YouTube
6. Contacto

---

## 7. Hero

### Objetivo

En 5 segundos, el visitante debe entender:

- quién sos
- qué hacés
- en qué sos fuerte
- por qué sos diferente

### Copy recomendado

#### Headline

> Backend Software Engineer especializado en Java, Spring Boot e IA aplicada.

#### Subheadline

> Construyo APIs, microservicios y soluciones backend robustas, combinando arquitectura limpia, seguridad y nuevas capacidades basadas en inteligencia artificial.

#### Texto de autoridad

> Además, comparto conocimiento técnico a través de mi canal de YouTube y mi libro sobre programación, ayudando a otros desarrolladores a crecer profesionalmente.

### CTAs

- Ver experiencia
- Contactar
- Ver libro
- Ver YouTube

### SEO del Hero

Debe contener texto visible con palabras clave importantes:

- Backend Software Engineer
- Java
- Spring Boot
- IA aplicada
- arquitectura backend
- APIs REST
- microservicios

---

## 8. Especialización técnica

### Objetivo

No listar tecnologías como cromos. Mostrar áreas de dominio.

### Agrupación recomendada

#### Backend Core

- Java
- Spring Boot
- Spring Security
- REST APIs
- Microservices
- SQL / MySQL
- Docker

#### Architecture & Quality

- Hexagonal Architecture
- Domain-Driven Design
- Clean Code
- Testing con JUnit y Mockito
- Diseño de APIs

#### AI Engineering

- Spring AI
- LLM integrations
- RAG
- AI agents / workflows
- Automatización con IA

#### Enterprise Stack

- Angular
- AWS
- Linux
- Bash / scripting

### Criterio sobre Angular

Angular encaja mejor que React para esta narrativa porque refuerza un stack enterprise habitual: **Angular + Java + Spring Boot**.

React puede omitirse o aparecer solo si algún proyecto concreto lo justifica.

---

## 9. Experiencia profesional

### Objetivo

Mostrar evolución profesional y contexto real.

### Orden recomendado

1. Optimissa — desde julio de 2025
2. Mytic Innova — septiembre 2022 a julio 2025, si las fechas son correctas
3. Malt / freelance — septiembre 2021 a septiembre 2022

### Formato recomendado

Cada experiencia debería incluir:

- Empresa
- Rol
- Fechas
- 3-5 bullets de impacto
- Stack principal
- Tipo de problemas resueltos

### Ejemplo de enfoque para Optimissa

> Desarrollo backend con Java y Spring Boot en entornos enterprise, trabajando sobre APIs, integración de sistemas, calidad de código y mantenimiento evolutivo de soluciones software.

Pendiente: completar con datos reales del proyecto si se pueden comunicar públicamente.

### Nota importante

Evitar descripciones genéricas como:

> “Participé en varios proyectos usando Java y Spring Boot.”

Mejor:

> “Diseñé y mantuve servicios backend con Java/Spring Boot, aplicando buenas prácticas de arquitectura, testing y seguridad en entornos empresariales.”

---

## 10. Libro y YouTube como diferencial

### Por qué es estratégico

Muchos perfiles backend pueden listar Java y Spring Boot. Pocos pueden demostrar:

- capacidad de enseñar
- comunicación técnica
- autoridad pública
- comunidad
- consistencia creando contenido
- impacto más allá del código

Esto debe aparecer como una sección principal, no como nota al pie.

### Sección recomendada

Título:

> Más que código: enseñanza, comunidad y divulgación técnica

Contenido:

- Libro publicado sobre aprender programación.
- Canal de YouTube técnico.
- Comunidad de desarrolladores.
- Cursos/videos sobre backend, arquitectura, AWS, concurrencia, Java, etc.

### Copy recomendado

> Además de trabajar como ingeniero backend, dedico parte de mi tiempo a enseñar programación y arquitectura de software. He publicado un libro para ayudar a nuevos desarrolladores a conseguir su primer empleo y comparto contenido técnico en YouTube sobre Java, backend, arquitectura y buenas prácticas.

### Métricas a incluir si están actualizadas

- Número de suscriptores.
- Visualizaciones totales.
- Número de alumnos/personas alcanzadas.
- Rating/reseñas del libro si son buenas.

Importante: usar métricas reales y actualizadas. Nada de inflar datos.

---

## 11. Proyectos y contenido técnico

### Objetivo

Demostrar criterio técnico.

Como muchos proyectos backend reales son privados, se pueden usar videos técnicos, demos, repos públicos y artículos como prueba de conocimiento.

### Piezas existentes aprovechables

Del portfolio anterior aparecen enlaces a contenido sobre:

- Arquitectura hexagonal
- AWS EC2/RDS
- AWS S3
- Concurrencia
- Proyectos web desplegados

### Recomendación 2026

Priorizar contenido alineado con el nuevo posicionamiento:

1. Java/Spring Boot
2. Arquitectura hexagonal
3. Spring Security
4. Spring AI / IA aplicada
5. AWS / despliegue
6. Testing backend

### Formato de cards

Cada proyecto/contenido debería mostrar:

- Título
- Problema que resuelve
- Tecnologías
- Resultado o aprendizaje
- Link a video/repo/demo

No mostrar solo imágenes clicables. Eso comunica poco.

---

## 12. Diseño visual

### Dirección visual recomendada

Estética:

- Dark mode elegante.
- Minimalismo técnico.
- Layout editorial.
- Alto contraste.
- Tipografía sólida.
- Acentos en azul/cian o verde sobrio.
- Animaciones sutiles.

### Qué evitar

- Exceso de emojis.
- Demasiados iconos de tecnologías.
- Cards gigantes sin contenido.
- Gradientes exagerados.
- Animaciones por decorar.
- Efectos que dañen performance o accesibilidad.

### Principio rector

> El diseño debe hacer que el contenido parezca más senior, no competir contra él.

### Inspiración de estilo

Sin copiar visuales, conviene buscar referencias en:

- portfolios de software engineers senior
- páginas personales de engineering leads
- landing pages de tools dev modernas
- documentación técnica bien diseñada

### Componentes visuales recomendados

- Hero con headline grande.
- Secciones con ancho máximo controlado.
- Timeline para experiencia.
- Cards editoriales para proyectos.
- Bloque destacado para libro/YouTube.
- Badges sobrios para tecnologías.
- Footer limpio con enlaces sociales.

---

## 13. SEO — Estrategia principal

El SEO debe ser una prioridad desde el diseño, no algo añadido al final.

### Objetivo SEO

Posicionar búsquedas relacionadas con:

- Daniel Españadero
- Daniel Españadero Java
- Daniel Españadero Spring Boot
- Backend developer Java España
- Software engineer Java Spring Boot
- Desarrollador backend Java Spring Boot
- Spring Boot IA
- Spring AI español
- Programador Java Spring Boot
- Arquitectura hexagonal Java
- Libro aprender programación Daniel Españadero
- Canal YouTube programación Daniel Españadero

### Tipos de intención de búsqueda

#### 13.1. Búsqueda de marca

Usuarios que ya conocen el nombre.

Ejemplos:

- Daniel Españadero
- Daniel Espanadero
- Daniel Españadero portfolio
- Daniel Españadero libro
- Daniel Españadero YouTube

Objetivo:

- Dominar resultados con página oficial, libro, YouTube, GitHub y LinkedIn.

#### 13.2. Búsqueda profesional

Recruiters o empresas buscando perfiles.

Ejemplos:

- backend developer Java Spring Boot España
- software engineer Java Spring Boot
- desarrollador backend Java Madrid
- Java Spring Boot developer

Objetivo:

- Que el portfolio tenga contenido semántico suficiente para asociar el perfil a esas búsquedas.

#### 13.3. Búsqueda educativa/técnica

Personas buscando contenido técnico.

Ejemplos:

- arquitectura hexagonal Java
- Spring Boot arquitectura hexagonal
- Spring Security JWT
- Spring AI tutorial español
- aprender programación libro

Objetivo:

- Capturar tráfico técnico y llevarlo hacia autoridad profesional.

---

## 14. SEO técnico en Astro

### 14.1. Configurar `site` en Astro

Astro usa `site` para generar URLs absolutas, sitemap y canonical URLs.

```js
export default defineConfig({
  site: 'https://daniel-espanadero.com'
});
```

### 14.2. Sitemap

Instalar y configurar `@astrojs/sitemap`.

```js
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://daniel-espanadero.com',
  integrations: [sitemap()]
});
```

Debe generar sitemap para:

- `/`
- `/libro/`
- `/youtube/`
- `/proyectos/`
- futuras páginas/blog si existen

### 14.3. Robots.txt

Archivo recomendado:

```txt
User-agent: *
Allow: /

Sitemap: https://daniel-espanadero.com/sitemap-index.xml
```

### 14.4. Canonical URLs

Cada página debe incluir canonical.

Ejemplo:

```astro
---
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<link rel="canonical" href={canonicalURL} />
```

### 14.5. Meta title

Reglas:

- 50-60 caracteres aproximados.
- Incluir marca y keyword principal.
- No repetir títulos entre páginas.

Ejemplo home:

```txt
Daniel Españadero | Java, Spring Boot & AI Backend Engineer
```

Ejemplo alternativo en español:

```txt
Daniel Españadero | Backend Java, Spring Boot e IA
```

### 14.6. Meta description

Reglas:

- 140-160 caracteres aproximados.
- Incluir propuesta clara.
- Evitar relleno.

Ejemplo:

```txt
Backend Software Engineer especializado en Java, Spring Boot, arquitectura e IA aplicada. Autor de un libro de programación y creador técnico en YouTube.
```

### 14.7. Open Graph

Cada página debe incluir:

- `og:title`
- `og:description`
- `og:type`
- `og:url`
- `og:image`
- `og:image:alt`

### 14.8. Twitter/X cards

Incluir:

- `twitter:card`
- `twitter:title`
- `twitter:description`
- `twitter:image`

### 14.9. Imágenes sociales

Crear al menos una imagen OG:

```txt
1200x630 px
```

Debe contener:

- Daniel Españadero
- Backend Software Engineer
- Java · Spring Boot · AI
- foto o marca visual

---

## 15. SEO semántico y estructura HTML

### Reglas

- Un solo `h1` por página.
- Secciones claras con `h2`.
- Usar `section`, `article`, `nav`, `header`, `main`, `footer`.
- Evitar divitis.
- Links con texto descriptivo.
- Imágenes con `alt` útil.

### Home recomendada

```html
<h1>Backend Software Engineer especializado en Java, Spring Boot e IA aplicada</h1>

<h2>Especialización backend</h2>
<h2>Experiencia profesional</h2>
<h2>Proyectos y contenido técnico</h2>
<h2>Libro y comunidad</h2>
<h2>Contacto</h2>
```

### Evitar

```html
<h1>Hola 👋</h1>
```

Eso desperdicia el elemento SEO más importante de la página.

---

## 16. Structured Data / JSON-LD

Astro permite inyectar JSON-LD con `set:html={JSON.stringify(...)}`.

### Schemas recomendados

#### 16.1. Person

Para Daniel como profesional.

Campos recomendados:

- name
- jobTitle
- url
- image
- sameAs
- knowsAbout
- worksFor
- alumniOf, si aplica

Ejemplo:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Daniel Españadero",
  "url": "https://daniel-espanadero.com",
  "jobTitle": "Backend Software Engineer",
  "knowsAbout": [
    "Java",
    "Spring Boot",
    "Spring Security",
    "Microservices",
    "Hexagonal Architecture",
    "Domain-Driven Design",
    "Artificial Intelligence",
    "Spring AI"
  ],
  "sameAs": [
    "https://www.youtube.com/@danielespanadero",
    "https://www.linkedin.com/in/...",
    "https://github.com/..."
  ]
}
```

#### 16.2. WebSite

Para el sitio principal.

#### 16.3. Book

Para la página del libro.

Campos recomendados:

- name
- author
- url
- image
- inLanguage
- offers, si se enlaza a Amazon

#### 16.4. ProfilePage

Para la home o página sobre mí.

#### 16.5. VideoObject

Para videos destacados de YouTube si se crean páginas específicas.

---

## 17. SEO de contenidos

### Páginas recomendadas inicialmente

#### `/`

Página principal de marca y perfil profesional.

Keyword principal:

```txt
Daniel Españadero backend Java Spring Boot IA
```

#### `/libro/`

Página dedicada al libro.

Keywords:

```txt
libro aprender programación
guía para aprender a programar Daniel Españadero
conseguir primer empleo programador
```

#### `/youtube/`

Página dedicada al canal.

Keywords:

```txt
canal YouTube programación Java backend
Daniel Españadero YouTube programación
```

#### `/proyectos/`

Página de proyectos/contenido técnico.

Keywords:

```txt
arquitectura hexagonal Java
Spring Boot proyectos backend
AWS backend Java
```

### Futuro blog técnico

Muy recomendable para SEO.

Astro es excelente para contenido tipo Markdown/MDX.

Artículos sugeridos:

1. `Arquitectura hexagonal con Java y Spring Boot`
2. `Spring Security con JWT explicado desde cero`
3. `Cómo integrar IA en aplicaciones Spring Boot con Spring AI`
4. `Errores comunes al aprender Java backend`
5. `De junior a backend developer: roadmap realista`
6. `RAG con Java y Spring AI`
7. `Testing en Spring Boot con JUnit y Mockito`

Esto puede posicionar muchísimo mejor que una landing estática sola.

---

## 18. Estrategia para competir contra otros perfiles

### Limitación actual

En esta sesión no hay acceso a un buscador general tipo Google para encontrar automáticamente competidores reales. Se pueden analizar URLs concretas si se proporcionan.

### Metodología recomendada

Buscar manualmente en incógnito y documentar los 10 primeros resultados para:

- `backend developer java spring boot España`
- `desarrollador backend java spring boot portfolio`
- `software engineer java spring boot España`
- `Spring Boot developer Spain`
- `arquitectura hexagonal Java Spring Boot`
- `Spring AI español`
- `programador Java Spring Boot Madrid`

Para cada resultado analizar:

- Title SEO.
- Meta description.
- H1.
- Estructura de página.
- Autoridad externa: GitHub, LinkedIn, YouTube, blog.
- Velocidad.
- Diseño.
- Profundidad de contenido.
- Structured data.
- Backlinks visibles.

### Cómo superar perfiles similares

#### 18.1. Mejor especificidad

Muchos portfolios dicen:

> Full Stack Developer passionate about technology.

Eso es flojo.

El portfolio nuevo debe decir:

> Backend Software Engineer especializado en Java, Spring Boot, Spring Security, arquitectura e IA aplicada.

Más específico gana.

#### 18.2. Mejor prueba de autoridad

Competidores suelen tener:

- experiencia
- GitHub
- LinkedIn

Daniel además tiene:

- libro
- YouTube
- comunidad
- contenido técnico educativo

Eso hay que explotarlo.

#### 18.3. Mejor SEO técnico

Muchos portfolios no tienen:

- sitemap correcto
- structured data
- canonical
- buenas meta tags
- contenido semántico
- páginas dedicadas

Este portfolio debe tenerlo desde el día uno.

#### 18.4. Mejor contenido long-tail

Para competir por keywords genéricas es difícil. Para ganar long-tail es mucho más realista.

Ejemplos long-tail potentes:

- `Spring Security JWT Java español`
- `arquitectura hexagonal Spring Boot ejemplo`
- `Spring AI tutorial español`
- `backend developer Java Spring Boot IA`
- `libro para aprender programación primer empleo`

---

## 19. Internacionalización

### Decisión pendiente

El portfolio anterior tenía español e inglés.

Para SEO, hay dos opciones.

### Opción A — Solo español inicialmente

Pros:
- Más rápido.
- Mejor foco.
- Encaja con YouTube/libro si la audiencia principal es española.
- Menos complejidad SEO.

Contras:
- Menor alcance internacional.

### Opción B — Español e inglés

Pros:
- Mejor para recruiters internacionales.
- Más profesional globalmente.

Contras:
- Más trabajo.
- Hay que implementar `hreflang` correctamente.
- Hay que mantener dos versiones de copy.

### Recomendación

Lanzar primero en español con arquitectura preparada para inglés.

Luego añadir `/en/` con `hreflang` cuando el contenido esté validado.

---

## 20. Performance SEO

### Objetivos

- Lighthouse Performance alto.
- Carga inicial mínima.
- Imágenes optimizadas.
- Sin JavaScript innecesario.
- Buen LCP.
- Buen CLS.
- Buen INP.

### Acciones

- Usar Astro para generar HTML estático siempre que sea posible.
- Optimizar imágenes.
- Usar formatos modernos: WebP/AVIF.
- Definir dimensiones de imágenes para evitar layout shift.
- Lazy loading en imágenes no críticas.
- Preload solo de recursos críticos.
- Evitar librerías pesadas de animación.
- No usar React en cliente salvo necesidad real.

---

## 21. Accesibilidad

SEO y accesibilidad van juntos.

### Reglas

- Contraste AA mínimo.
- Navegación por teclado.
- Estados focus visibles.
- Labels reales en formularios.
- Texto alternativo en imágenes.
- Botones para acciones, links para navegación.
- No depender solo del color.

---

## 22. Contacto con Resend

### Arquitectura

```txt
Formulario Astro
  ↓ POST /api/contact
Astro API endpoint ejecutado en Cloudflare Pages Functions
  ↓
Resend SDK
  ↓
Email a Daniel
```

### Variables de entorno

```env
RESEND_API_KEY=...
CONTACT_TO_EMAIL=developer@daniel-espanadero.com
CONTACT_FROM_EMAIL=Portfolio <contact@daniel-espanadero.com>
```

### Reglas de seguridad

- Nunca usar `PUBLIC_RESEND_API_KEY`.
- Nunca usar `VITE_RESEND_API`.
- La API key debe vivir solo en el entorno de Cloudflare.
- Validar nombre, email y mensaje.
- Añadir honeypot anti-spam.
- Opcional: rate limiting si se detecta abuso.

### Requisitos Resend

- Verificar dominio en Resend.
- Configurar registros DNS necesarios.
- Usar un `from` del dominio verificado.

---

## 23. Cloudflare Pages + Hostinger

### Decisión

Usar:

- Cloudflare Pages para deploy.
- Cloudflare DNS para gestión DNS.
- Hostinger como registrador del dominio.

### Motivo

Es la opción más limpia:

- SSL/CDN/DNS/deploy integrados.
- Mejor experiencia con Cloudflare Pages.
- Más control futuro.

### Pasos generales

1. Crear proyecto en Cloudflare Pages.
2. Conectar repositorio GitHub/GitLab.
3. Configurar build.
4. Añadir dominio custom `daniel-espanadero.com`.
5. Cambiar nameservers en Hostinger hacia Cloudflare.
6. Configurar variables de entorno de Resend.
7. Verificar dominio en Resend con registros DNS.

---

## 24. Roadmap de implementación

### Fase 1 — Setup base

- Crear proyecto Astro.
- Configurar TypeScript.
- Configurar estructura de carpetas.
- Configurar Cloudflare adapter.
- Configurar sitemap.
- Crear layout base.
- Crear componente SEO.

### Fase 2 — Diseño visual

- Definir tokens:
  - colores
  - tipografías
  - espaciados
  - radios
  - sombras
- Crear sistema básico de componentes:
  - Button
  - Card
  - Badge
  - Section
- Crear hero.
- Crear layout responsive.

### Fase 3 — Contenido principal

- Home.
- Skills agrupadas.
- Experiencia profesional.
- Proyectos/contenido técnico.
- Libro y YouTube.
- Contacto.

### Fase 4 — SEO avanzado

- Meta tags por página.
- Canonicals.
- Sitemap.
- Robots.
- JSON-LD Person.
- JSON-LD WebSite.
- JSON-LD Book.
- Open Graph images.
- Revisión semántica de headings.

### Fase 5 — Contacto

- Endpoint `/api/contact`.
- Integración Resend.
- Validaciones.
- Honeypot.
- Mensajes de estado.

### Fase 6 — Deploy

- Cloudflare Pages.
- Variables de entorno.
- Dominio.
- DNS.
- Resend domain verification.

### Fase 7 — Medición

- Google Search Console.
- Bing Webmaster Tools.
- Cloudflare Web Analytics.
- Validación de sitemap.
- Validación de rich results.

---

## 25. Checklist SEO inicial

- [ ] `site` configurado en Astro.
- [ ] Sitemap generado.
- [ ] Robots.txt creado.
- [ ] Canonical en todas las páginas.
- [ ] Title único por página.
- [ ] Meta description única por página.
- [ ] Open Graph completo.
- [ ] Twitter cards.
- [ ] Imagen OG 1200x630.
- [ ] Un solo H1 por página.
- [ ] Headings jerárquicos.
- [ ] JSON-LD Person.
- [ ] JSON-LD WebSite.
- [ ] JSON-LD Book.
- [ ] Alt texts correctos.
- [ ] URLs limpias.
- [ ] Search Console configurado.
- [ ] Sitemap enviado a Search Console.
- [ ] Página indexable sin `noindex`.
- [ ] Performance revisada.
- [ ] Mobile revisado.

---

## 26. Decisiones tomadas

- El nuevo portfolio se hará desde cero.
- El portfolio anterior solo será referencia.
- Framework elegido: AstroJS.
- Deploy elegido: Cloudflare Pages free.
- DNS recomendado: Cloudflare, manteniendo Hostinger como registrador.
- Contacto: Resend desde endpoint server-side.
- Stack protagonista: Java, Spring Boot, Spring Security, arquitectura e IA.
- Supporting frontend: Angular, no React.
- Libro y YouTube serán secciones principales.
- SEO será prioridad desde arquitectura y contenido.

---

## 27. Pendientes de definición

- Confirmar copy definitivo del hero.
- Confirmar métricas actuales de YouTube.
- Confirmar datos públicos de Optimissa.
- Confirmar URLs oficiales:
  - LinkedIn
  - GitHub
  - YouTube
  - Amazon/libro
- Confirmar si habrá versión inglesa en primera release.
- Confirmar si se quiere blog desde el lanzamiento o como fase posterior.
- Confirmar dirección visual final.

---

## 28. Recomendación final

No construir un portfolio que diga “sé programar”.

Construir un portfolio que diga:

> Sé diseñar backend serio con Java y Spring Boot, entiendo arquitectura, estoy incorporando IA aplicada y además tengo capacidad de enseñar, comunicar y generar comunidad.

Ese posicionamiento es mucho más fuerte, más memorable y más difícil de copiar.




Quiero que generes una pagina web moderna, con tonos oscuros, que sirva como portfolio de presentacion como ingeniero de software para Daniel Españadero. Busca informacion actualizada sobre el y diseña al completo
