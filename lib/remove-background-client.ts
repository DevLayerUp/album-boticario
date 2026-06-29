/** CDN dos modelos ONNX — deve coincidir com a versão de @imgly/background-removal. */
const IMGLY_PUBLIC_PATH =
  "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

/** Glue WASM servido de public/onnxruntime-web/ (scripts/copy-ort-wasm.mjs). */
const ORT_WASM_PATHS = {
  mjs: "/onnxruntime-web/ort-wasm-simd-threaded.mjs",
  wasm: "/onnxruntime-web/ort-wasm-simd-threaded.wasm",
} as const;

type OrtWasmEnv = {
  env: { wasm: Record<string, unknown> };
};

/**
 * O imgly baixa glue WASM como blob:; com Next.js isso quebra o import() dinâmico.
 * Fixamos wasmPaths em URLs HTTP (mesma origem) antes do imgly criar a sessão.
 */
async function lockOrtWasmPaths(): Promise<void> {
  // @ts-expect-error onnxruntime-web exports não resolvem tipos via package.json
  const ort = (await import("onnxruntime-web")) as { default: OrtWasmEnv };

  const wasmPaths = { ...ORT_WASM_PATHS };

  Object.defineProperty(ort.default.env.wasm, "wasmPaths", {
    get: () => wasmPaths,
    set: () => {},
    configurable: true,
  });
  Object.defineProperty(ort.default.env.wasm, "numThreads", {
    get: () => 1,
    set: () => {},
    configurable: true,
  });
}

/** Remoção de fundo gratuita no navegador (@imgly/background-removal). */
export async function removeBackgroundInBrowser(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<Blob> {
  await lockOrtWasmPaths();

  const { removeBackground } = await import("@imgly/background-removal");

  const blob = await removeBackground(file, {
    publicPath: IMGLY_PUBLIC_PATH,
    model: "isnet_quint8",
    proxyToWorker: false,
    output: { format: "image/png" },
    progress: (_key: string, current: number, total: number) => {
      if (total > 0) onProgress?.(current / total);
    },
  });

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("Não foi possível remover o fundo no navegador.");
  }

  return blob;
}
