

# Acessar Google Maps Diretamente para Prospecção

## Situação Atual

Seu sistema **já tem integração com Google Maps** via SerpAPI implementada! A edge function `web-search` já usa o engine `google_maps` quando você configura uma chave SerpAPI.

## O que você precisa fazer

Para ativar o acesso ao Google Maps:

1. **Obter uma chave SerpAPI** (se ainda não tiver)
   - Acesse [serpapi.com](https://serpapi.com)
   - Crie uma conta gratuita (100 buscas/mês grátis)
   - Copie sua API Key do painel

2. **Configurar nas suas configurações**
   - Você já está na página de Configurações
   - Cole a chave no campo "SerpAPI"
   - Clique em "Testar" para validar
   - Clique em "Salvar"

3. **Opcional: Definir como API preferida**
   - Na seção "API de Busca Preferida", selecione "SerpAPI (Google Maps)"
   - Isso garantirá que o Google Maps seja usado como fonte primária

## Benefícios do Google Maps via SerpAPI

| Dados Capturados | Disponível |
|------------------|------------|
| Nome do negócio | Sim |
| Telefone | Sim |
| Endereço completo | Sim |
| Website | Sim |
| Avaliação (estrelas) | Sim |
| Número de reviews | Sim |
| Foto do estabelecimento | Sim |
| Categoria/Tipo | Sim |
| Horário de funcionamento | Sim |
| Coordenadas GPS | Sim |

## Comparativo: Serper.dev vs SerpAPI (Google Maps)

| Característica | Serper.dev | SerpAPI |
|----------------|------------|---------|
| Buscas grátis/mês | 2.500 | 100 |
| Acesso Google Maps | Places (limitado) | Completo |
| Qualidade dos dados | Boa | Excelente |
| Fotos de estabelecimentos | Às vezes | Sempre |
| Telefones | Frequente | Quase sempre |
| Melhor para | Volume alto | Qualidade alta |

## Recomendação

Use **ambas as APIs** em conjunto:
- **Serper.dev** como padrão (maior volume gratuito)
- **SerpAPI** quando precisar de dados mais completos do Google Maps

O sistema já faz **fallback automático** - se uma API falhar, tenta a outra.

## Detalhes Técnicos

O código em `supabase/functions/web-search/index.ts` já implementa:

```text
┌─────────────────────────────────────────────────────────┐
│         Fluxo de Busca de Leads                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Usuário faz busca ("Restaurantes em São Paulo")     │
│                         │                               │
│                         ▼                               │
│  2. Sistema verifica preferred_search_api               │
│     ├─ serper → Serper.dev Places API                   │
│     └─ serpapi → SerpAPI Google Maps Engine             │
│                         │                               │
│                         ▼                               │
│  3. Se falhar → tenta API alternativa (fallback)        │
│                         │                               │
│                         ▼                               │
│  4. Retorna leads com telefone, foto, rating, etc.      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Campos extraídos do Google Maps:
- `title` → Nome do negócio
- `phone` → Telefone
- `address` → Endereço
- `website` → Site
- `rating` → Avaliação (1-5 estrelas)
- `reviews` → Quantidade de avaliações
- `thumbnail` → Foto do estabelecimento
- `type` → Categoria do negócio
- `place_id` → Link direto para Google Maps

## Ação Necessária

Basta configurar sua chave SerpAPI na aba de configurações onde você está agora. Não é necessário nenhuma alteração no código - tudo já está implementado e funcionando.

