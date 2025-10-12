/**
 * Script para generar iconos PWA desde el logo existente
 * Usa sharp para redimensionar imágenes
 */

import sharp from 'sharp'
import { existsSync } from 'fs'
import { join } from 'path'

const sizes = [192, 512]
const inputLogo = 'src/assets/hincha-store-logo.png'
const outputDir = 'public'

async function generateIcons() {
  if (!existsSync(inputLogo)) {
    console.error(`❌ Logo no encontrado: ${inputLogo}`)
    process.exit(1)
  }

  console.log('🎨 Generando iconos PWA...\n')

  for (const size of sizes) {
    const outputPath = join(outputDir, `pwa-${size}x${size}.png`)

    try {
      await sharp(inputLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath)

      console.log(`✅ Creado: ${outputPath}`)
    } catch (error) {
      console.error(`❌ Error creando ${outputPath}:`, error.message)
    }
  }

  console.log('\n✨ Iconos PWA generados exitosamente!')
}

generateIcons()
