import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Remove todos os dados do usuário: arquivos no storage e registro em auth.users
 * (cascata no banco apaga profile, figurinhas, pacotes, trocas, etc.).
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: files, error: listError } = await admin.storage
    .from("stickers")
    .list(userId);

  if (listError) {
    console.error("deleteUserAccount storage list:", listError);
  } else if (files?.length) {
    const paths = files.map((file) => `${userId}/${file.name}`);
    const { error: removeError } = await admin.storage.from("stickers").remove(paths);
    if (removeError) {
      console.error("deleteUserAccount storage remove:", removeError);
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(error.message);
  }
}
