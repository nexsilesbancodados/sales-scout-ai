

# Implementar Serper.dev como Alternativa ao SerpAPI

## Resumo
Adicionar o Serper.dev como uma alternativa ao SerpAPI para buscas de leads, permitindo que cada usuário escolha qual serviço utilizar. O Serper.dev oferece 2.500 buscas gratuitas por mês (vs 100 do SerpAPI), tornando-o uma opção mais generosa para prospecção.

## Visão Geral da Implementação

```text
┌─────────────────────────────────────────────────────────────┐
│                    Configurações (UI)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │  SerpAPI    │   │ Serper.dev  │   │ Preferência      │  │
│  │  (Chave)    │   │ (Chave)     │   │ [v] Serper.dev   │  │
│  └─────────────┘   └─────────────┘   └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Edge Function (web-search)                   │
├─────────────────────────────────────────────────────────────┤
│  1. Verifica preferência do usuário                         │
│  2. Se Serper → usa API Serper.dev                          │
│  3. Se SerpAPI → usa API SerpAPI (atual)                    │
│  4. Fallback automático se uma falhar                       │
└─────────────────────────────────────────────────────────────┘
```

## Etapas de Implementação

### 1. Migration do Banco de Dados
Adicionar dois novos campos na tabela `user_settings`:
- `serper_api_key` (text, nullable) - Chave do Serper.dev
- `preferred_search_api` (text, default 'serper') - API preferida ('serper' ou 'serpapi')

### 2. Atualizar Types do TypeScript
Adicionar os novos campos no arquivo `src/types/database.ts`:
```typescript
// Em UserSettings
serper_api_key: string | null;
preferred_search_api: 'serper' | 'serpapi';
```

### 3. Atualizar Edge Function `web-search`
Modificar para suportar ambas APIs:

```typescript
// Lógica de seleção
const preferredApi = userSettings?.preferred_search_api || 'serper';

if (preferredApi === 'serper' && SERPER_API_KEY) {
  // Usar Serper.dev
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: searchQuery,
      gl: 'br',
      hl: 'pt-br',
      num: num_results
    })
  });
} else {
  // Usar SerpAPI (código atual)
}
```

### 4. Atualizar Edge Function `ai-prospecting`
Mesma lógica de seleção de API para buscas no Google Maps.

### 5. Atualizar UI de Configurações (ApiKeysSettings.tsx)
Adicionar:
- Card para chave do Serper.dev (similar ao SerpAPI)
- Seletor de API preferida (RadioGroup ou Select)
- Teste de validação da chave Serper.dev

### 6. Atualizar Hook `use-user-settings`
Garantir que os novos campos são parseados corretamente.

## Comparativo das APIs

| Característica | SerpAPI | Serper.dev |
|----------------|---------|------------|
| Buscas grátis/mês | 100 | 2.500 |
| Velocidade | 2-3s | 1-2s |
| Google Maps | Sim | Sim (Places) |
| Preço pago | $50/5000 | $50/50000 |

## Arquivos a Modificar

1. **Nova Migration SQL** - Adicionar campos `serper_api_key` e `preferred_search_api`
2. **src/types/database.ts** - Tipos TypeScript
3. **supabase/functions/web-search/index.ts** - Lógica dual de API
4. **supabase/functions/ai-prospecting/index.ts** - Lógica dual para prospecção
5. **src/components/settings/ApiKeysSettings.tsx** - UI com nova seção Serper + seletor
6. **src/hooks/use-user-settings.ts** - Defaults para novos campos

## Detalhes Técnicos

### Formato de Resposta do Serper.dev
```json
{
  "organic": [
    {
      "title": "...",
      "link": "...",
      "snippet": "...",
      "position": 1
    }
  ],
  "places": [
    {
      "title": "...",
      "address": "...",
      "phone": "...",
      "website": "..."
    }
  ]
}
```

### Mapeamento de Campos
A resposta do Serper.dev será normalizada para o mesmo formato que SerpAPI usa internamente, garantindo compatibilidade com todo o sistema de leads existente.

### Fallback Automático
Se a API preferida falhar (chave inválida, quota excedida), o sistema tentará automaticamente a outra API configurada.

