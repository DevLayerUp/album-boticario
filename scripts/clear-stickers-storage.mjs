#!/usr/bin/env node
/**
 * Limpa o bucket "stickers" (avatars/figurinhas de usuários).
 * O Supabase não permite DELETE direto em storage.objects via SQL.
 *
 * Uso:
 *   node scripts/clear-stickers-storage.mjs           # apaga tudo
 *   node scripts/clear-stickers-storage.mjs --dry-run # só lista
 *
 * Variáveis em .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUCKET = "stickers";
const BATCH_SIZE = 100;
const dryRun = process.argv.includes("--dry-run");

function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente em .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

/** Lista recursivamente todos os arquivos do bucket (pastas {userId}/...). */
async function listAllFilePaths(prefix = "") {
  const paths = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw new Error(`list(${prefix || "/"}): ${error.message}`);
    if (!data?.length) break;

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      // Pastas não têm id; arquivos têm id preenchido
      if (item.id === null) {
        paths.push(...(await listAllFilePaths(itemPath)));
      } else {
        paths.push(itemPath);
      }
    }

    if (data.length < 1000) break;
    offset += data.length;
  }

  return paths;
}

async function removeInBatches(paths) {
  for (let i = 0; i < paths.length; i += BATCH_SIZE) {
    const batch = paths.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) throw new Error(`remove: ${error.message}`);
    console.log(`   removidos ${Math.min(i + BATCH_SIZE, paths.length)}/${paths.length}`);
  }
}

async function main() {
  console.log(`\n🗂️  Bucket "${BUCKET}"${dryRun ? " (dry-run)" : ""}\n`);

  const paths = await listAllFilePaths();

  if (paths.length === 0) {
    console.log("✅  Nenhum arquivo encontrado — bucket já está vazio.\n");
    return;
  }

  console.log(`   ${paths.length} arquivo(s) encontrado(s)`);
  if (dryRun) {
    paths.slice(0, 20).forEach((p) => console.log(`   - ${p}`));
    if (paths.length > 20) console.log(`   ... e mais ${paths.length - 20}`);
    console.log("\n   Rode sem --dry-run para apagar.\n");
    return;
  }

  await removeInBatches(paths);
  console.log(`\n✅  ${paths.length} arquivo(s) removido(s) do bucket "${BUCKET}".\n`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
