# Hincha Store — Frontend

Marketplace para hinchas: descubrí, publicá y comprá camisetas y accesorios.  
Frontend en **React + Vite + Chakra UI**, conectado al backend `hincha-api`.

---

## 🚀 Features

- **Catálogo** con filtros/orden: nuevos ingresos, tendencias.
- **Detalle de producto** con variantes (talles) y precio.
- **Carrito** con persistencia local.
- **Publicar producto** con carga de imagen (drag & drop), validaciones (Zod) y barra de progreso.
- **Soporte de personalización** (opcional): nombre/número y parches por producto.
- **Imágenes optimizadas** con Cloudinary (`f_auto`, `q_auto`, `w/h`).
- **Dark mode** (automático y con toggle).
- **Footer** con versión de la app (inyectada desde `package.json`).

---

## 🧱 Stack

- **React 18/19**, **Vite**.
- **Chakra UI** (UI + dark mode).
- **React Router**.
- **Axios** (cliente HTTP).
- **Zod + React Hook Form** (formularios y validación).
- **Cloudinary** (imágenes).

---

## ✅ Requisitos

- Node.js ≥ 18 (recomendado 20+).
- pnpm (o npm/yarn). El repo usa pnpm.

---

## 🔧 Configuración de entorno

Crea un archivo `.env` en la raíz:

```bash
# URL del backend (Next.js API)
VITE_API_BASE_URL=https://hincha-api.vercel.app

# Cloudinary (solo el "cloud name", NO keys)
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
