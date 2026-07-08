import { TimeoutError, withTimeout } from "@/lib/with-timeout";

/** CDN dos modelos ONNX — deve coincidir com a versão de @imgly/background-removal. */
const IMGLY_PUBLIC_PATH =
  "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

/** Glue WASM servido de public/onnxruntime-web/ (scripts/copy-ort-wasm.mjs). */
const ORT_WASM_PATHS = {
  mjs: "/onnxruntime-web/ort-wasm-simd-threaded.mjs",
  wasm: "/onnxruntime-web/ort-wasm-simd-threaded.wasm",
} as const;

/** Tempo máximo no navegador antes de tentar o fallback no servidor. */
export const BROWSER_BG_REMOVAL_TIMEOUT_MS = 90_000;

type OrtWasmEnv = {
  env: { wasm: Record<string, unknown> };
};

export type BackgroundRemovalProgress = (
  message: string,
  fraction?: number,
) => void;

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
    model: "isnet_fp16",
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

/** Fallback via POST /api/sticker/remove-bg (remove.bg no servidor). */
export async function removeBackgroundViaServer(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("image", file, file.name || "photo.jpg");

  const res = await fetch("/api/sticker/remove-bg", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(json?.error ?? "Não foi possível processar a foto no servidor.");
    }

    throw new Error("Não foi possível processar a foto no servidor.");
  }

  const blob = await res.blob();
  if (!blob.size) {
    throw new Error("Recorte vazio retornado pelo servidor.");
  }

  return blob;
}

/**
 * Tenta remover o fundo no navegador (com timeout) e cai para o servidor se falhar.
 */
export async function removeBackgroundWithFallback(
  file: File,
  onProgress?: BackgroundRemovalProgress,
): Promise<Blob> {
  try {
    const blob = await withTimeout(
      removeBackgroundInBrowser(file, (fraction) => {
        onProgress?.(
          fraction < 0.2
            ? "Carregando modelo (só na 1ª vez)…"
            : "Removendo fundo…",
          fraction,
        );
      }),
      BROWSER_BG_REMOVAL_TIMEOUT_MS,
      "Remoção de fundo expirou no navegador.",
    );
    return blob;
  } catch (browserError) {
    console.warn("[remove-background] browser failed, trying server:", browserError);

    onProgress?.("Processando no servidor…");
    try {
      return await withTimeout(
        removeBackgroundViaServer(file),
        60_000,
        "Processamento no servidor expirou.",
      );
    } catch (serverError) {
      if (browserError instanceof TimeoutError) {
        throw new Error(
          "Demorou demais para processar a foto. Tente outra imagem ou use Wi-Fi.",
        );
      }

      throw serverError instanceof Error
        ? serverError
        : new Error("Erro ao processar a foto.");
    }
  }
}
