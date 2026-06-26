"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // Reload completo para limpar estado do servidor
    window.location.href = "/login";
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      loading={loading}
      className={cn("h-auto min-h-0 gap-1.5 px-3 py-1.5", className)}
    >
      {!loading && <LogOut aria-hidden className="size-4" strokeWidth={1.8} />}
      Sair
    </Button>
  );
}
