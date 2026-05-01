import { chromium } from 'playwright';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const baseUrl = process.env.VISUAL_CHECK_URL || 'http://localhost:3000';
const outDir = new URL('../artifacts/', import.meta.url);
const outPath = fileURLToPath(outDir);

await fs.mkdir(outPath, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function screenshotPage(name, path, viewport) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, outDir)), fullPage: true });
  return page;
}

const landing = await screenshotPage('landing-desktop', '/', { width: 1440, height: 960 });
await landing.mouse.click(320, 280);
await landing.waitForTimeout(80);
const sparkPixels = await landing.evaluate(() => {
  const canvas = document.querySelector('.click-spark-canvas');
  if (!canvas) return 0;
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let lit = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) lit += 1;
  }
  return lit;
});
await landing.close();

const login = await screenshotPage('login-desktop', '/login', { width: 1440, height: 960 });
await login.waitForTimeout(1200);
const ringPixels = await login.evaluate(() => {
  const canvas = document.querySelector('.magic-rings-container canvas');
  if (!canvas) return 0;
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return 0;
  const width = Math.min(240, gl.drawingBufferWidth);
  const height = Math.min(180, gl.drawingBufferHeight);
  const x = Math.max(0, Math.floor((gl.drawingBufferWidth - width) / 2));
  const y = Math.max(0, Math.floor((gl.drawingBufferHeight - height) / 2));
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let lit = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] + pixels[i + 1] + pixels[i + 2] + pixels[i + 3] > 0) lit += 1;
  }
  return lit;
});
await login.close();

const mobileLogin = await screenshotPage('login-mobile', '/login', { width: 390, height: 844 });
await mobileLogin.close();

await browser.close();

if (sparkPixels < 8) {
  throw new Error(`ClickSpark canvas did not render enough lit pixels: ${sparkPixels}`);
}

if (ringPixels < 50) {
  throw new Error(`MagicRings WebGL canvas did not render enough lit pixels: ${ringPixels}`);
}

console.log(`Visual check passed. Spark pixels: ${sparkPixels}. Ring pixels: ${ringPixels}.`);
