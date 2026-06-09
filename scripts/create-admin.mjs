#!/usr/bin/env node
/**
 * Cria (ou promove) um usuário admin no Supabase.
 *
 * Uso:
 *   node scripts/create-admin.mjs
 *
 * Variáveis necessárias em .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── load .env.local ────────────────────────────────────────────────────────
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
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

// ─── config — altere aqui ───────────────────────────────────────────────────
const ADMIN_EMAIL    = "admin@albumboticario.com.br";
const ADMIN_PASSWORD = "Admin@2026!";
const ADMIN_NAME     = "Admin GB";
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔧  Criando/atualizando admin: ${ADMIN_EMAIL}\n`);

  // 1. Check if user already exists
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error("❌  listUsers:", listErr.message); process.exit(1); }

  const existing = users.find((u) => u.email === ADMIN_EMAIL);

  let userId;

  if (existing) {
    console.log(`ℹ️   Usuário já existe (${existing.id}) — apenas atualizando role…`);
    userId = existing.id;
  } else {
    // 2. Create user
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME },
    });
    if (createErr) { console.error("❌  createUser:", createErr.message); process.exit(1); }
    userId = created.user.id;
    console.log(`✅  Usuário criado (${userId})`);
  }

  // 3. Set app_metadata.role = "admin"
  const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role: "admin" },
  });
  if (updateErr) { console.error("❌  updateUserById:", updateErr.message); process.exit(1); }
  console.log(`✅  app_metadata.role = "admin" definido`);

  // 4. Upsert profile row (trigger may already have created it)
  const { error: profileErr } = await supabase.from("profiles").upsert(
    { id: userId, display_name: ADMIN_NAME, username: "admin" },
    { onConflict: "id" },
  );
  if (profileErr) {
    console.warn(`⚠️   Upsert profile: ${profileErr.message} (não crítico)`);
  } else {
    console.log(`✅  Profile atualizado`);
  }

  console.log(`
─────────────────────────────────────────────
✅  Admin pronto!

   URL:   http://localhost:3000/login
   Email: ${ADMIN_EMAIL}
   Senha: ${ADMIN_PASSWORD}

   Acesse /admin após o login.
─────────────────────────────────────────────
`);
}

main();
