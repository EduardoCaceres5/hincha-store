Hincha Store — Frontend

Marketplace para hinchas: descubrí, publicá y comprá camisetas y accesorios.
Frontend en React + Vite + Chakra UI, conectado al backend hincha-api.

🚀 Features

Catálogo con filtros/orden: nuevos ingresos, tendencias.

Detalle de producto con variantes (talles) y precio.

Carrito con persistencia local.

Publicar producto con carga de imagen (drag & drop), validaciones (Zod) y barra de progreso.

Soporte de personalización (opcional): nombre/número y parches por producto.

Imágenes optimizadas con Cloudinary (f_auto, q_auto, w/h).

Dark mode (automático y con toggle).

Footer con versión de la app (inyectada desde package.json).

🧱 Stack

React 18/19, Vite.

Chakra UI (UI + dark mode).

React Router.

Axios (cliente HTTP).

Zod + React Hook Form (formularios y validación).

Cloudinary (imágenes).

✅ Requisitos

Node.js ≥ 18 (recomendado 20+).

pnpm (o npm/yarn) — el repo usa pnpm.

🔧 Configuración de entorno

Crea un archivo .env en la raíz:

# URL del backend (Next.js API)
VITE_API_BASE_URL=https://hincha-api.vercel.app

# Cloudinary (solo el "cloud name", NO keys)
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name


VITE_API_BASE_URL se usa en src/services/api.ts.
VITE_CLOUDINARY_CLOUD_NAME se usa para generar transformaciones/responsive images.

Versión de la app en el footer

En vite.config.ts se inyecta la versión desde package.json:

define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version) }


Y en src/types/global.d.ts:

declare const __APP_VERSION__: string;

▶️ Correr localmente
pnpm install
pnpm dev


Abre: http://localhost:5173

🏗️ Build y Deploy (Vercel)

Build command: pnpm build

Output directory: dist

Install command: pnpm install

Framework preset: Vite

Environment variables (Production/Preview):

VITE_API_BASE_URL=https://hincha-api.vercel.app

VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name

Asegurate que el backend tenga CORS habilitado para tu dominio del frontend.

📁 Estructura sugerida
src/
  components/
    AppFooter.tsx
    ProductCard.tsx
    ProductGrid.tsx
    HomePromoBanner.tsx
    HeroSection.tsx
  pages/
    Home.tsx
    Catalogo.tsx
    ProductDetail.tsx
    PublishProduct.tsx
    Login.tsx
  hooks/
    useCart.ts
    useProducts.ts
  services/
    api.ts
    products.ts
  types/
    Product.ts
  utils/
    cld.ts
public/
  placeholder-product.svg

Puntos clave

services/api.ts

import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
export default api


Cloudinary helpers (utils/cld.ts) – generar URLs con transformaciones:

export function cld(urlOrId: string, transform: string) { /* … */ }
export function cldSrcSet(urlOrId: string, widths: number[]) { /* … */ }


ProductCard usa fallbackSrc local para evitar hotlink:

<Image
  src={imageUrl}
  alt={title}
  objectFit="cover"
  fallbackSrc="/placeholder-product.svg"
/>


Hero + Banner están adaptados a modo oscuro.

🔐 Autenticación

El token JWT se guarda en localStorage como accessToken.

api.ts agrega Authorization: Bearer <token> automáticamente.

Para evitar CORS, el backend debe devolver Access-Control-Allow-Origin con el dominio exacto del frontend (sin / final).

🛒 Publicar producto (form)

Validación con Zod (título, precio, imagen, etc.).

Subida como multipart/form-data.

Variantes: se envía al menos una por defecto (Única) si no se selecciona talle.

Personalización (opcional): si está habilitada en el producto, se calcula un recargo y se envía en el payload del pedido.

🧪 Scripts
pnpm dev       # desarrollo
pnpm build     # producción (compila a /dist)
pnpm preview   # previsualizar build
pnpm lint      # (si configuraste ESLint)

🩺 Troubleshooting

CORS (bloqueado): confirmá que el backend responde con Access-Control-Allow-Origin: https://hincha-store.vercel.app (exacto, sin slash final).

404 solicitando /hincha-api.vercel.app/...: revisá VITE_API_BASE_URL; debe ser la URL del backend, no concatenada al dominio del front.

No se ve la imagen: confirma que imageUrl es una URL pública (Cloudinary o tu CDN) y que no requiere firma. Usa transformaciones (f_auto,q_auto,w_600,h_600,c_fill) para thumbnails.

TS “Cannot find module 'node:url'” en Vite config: instala @types/node y en tsconfig agrega "types": ["node"] o "moduleResolution": "bundler".

Placeholder caído: usa /public/placeholder-product.svg (incluido).

🧩 Personalización y Parches (opcional)

Si activaste en backend:

El detalle de producto muestra toggle “Personalizar”, inputs de nombre/número y parches disponibles.

El precio final refleja los recargos.

Podés mostrar un preview con Cloudinary si el backend expone previewImageUrl.

📝 Licencia

MIT — usalo y modificalo con libertad.

👤 Créditos

Desarrrollador por Zanka — Hincha Store Frontend.
