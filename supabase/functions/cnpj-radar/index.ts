const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, cnpj, filters } = await req.json();

    if (action === "lookup") {
      const clean = (cnpj || "").replace(/\D/g, "");
      if (clean.length !== 14) {
        return new Response(JSON.stringify({ error: "CNPJ inválido" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const res = await fetch(`https://api.opencnpj.org/${clean}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        return new Response(JSON.stringify({ error: "CNPJ não encontrado" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search") {
      const { uf, municipio, cnae, porte, limit = 50 } = filters || {};
      let url = `https://api.opencnpj.org/search?limit=${Math.min(limit, 100)}`;
      if (uf) url += `&uf=${uf}`;
      if (municipio) url += `&municipio=${encodeURIComponent(municipio)}`;
      if (cnae) url += `&cnae_fiscal=${cnae}`;
      if (porte) url += `&porte=${porte}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
