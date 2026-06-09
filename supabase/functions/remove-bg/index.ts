import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const REMOVE_BG_API_KEY = Deno.env.get("REMOVE_BG_API_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // Verificar token de autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Verificar JWT com Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Chamar remove.bg API
    const removeBgForm = new FormData();
    removeBgForm.append("image_file", imageFile);
    removeBgForm.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": REMOVE_BG_API_KEY },
      body: removeBgForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("remove.bg error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Falha ao remover fundo", details: errorText }),
        {
          status: response.status,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Converter para base64 e retornar
    const buffer = await response.arrayBuffer();
    const base64 = btoa(
      Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join(
        "",
      ),
    );

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${base64}` }),
      {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("remove-bg function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
