/** Copia glue WASM do onnxruntime-web para public/ (mesma origem, sem blob:). */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/onnxruntime-web/dist");
const destDir = join(root, "public/onnxruntime-web");

const files = ["ort-wasm-simd-threaded.mjs", "ort-wasm-simd-threaded.wasm"];

if (!existsSync(srcDir)) {
  console.warn("[copy-ort-wasm] onnxruntime-web não instalado — ignorando.");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });

for (const file of files) {
  cpSync(join(srcDir, file), join(destDir, file));
}

console.log("[copy-ort-wasm] Arquivos copiados para public/onnxruntime-web/");
