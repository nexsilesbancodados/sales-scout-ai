
# Plano: Corrigir Funcionalidades Incompletas

## Fase 1 — Scrapers sem Apify (Instagram/Facebook/Social)
- Substituir dependência do Apify por scraping via DuckDuckGo (padrão já usado no sistema)
- Instagram Scraper: usar DuckDuckGo para buscar perfis + extrair dados
- Facebook Scraper: usar DuckDuckGo + scraping de páginas públicas
- Remover necessidade de APIFY_TOKEN

## Fase 2 — UI Faltando
- Export Data: Adicionar botões de exportação CSV/PDF no Dashboard e CRM
- Cold Reactivation: Criar interface de configuração e ativação
- Webhook Config: Adicionar botão de teste do webhook

## Fase 3 — Lógica de Backend
- A/B Testing: Implementar rastreamento real de variantes e cálculo de vencedores
- Campanhas: Criar edge function para execução automática de campanhas
- Scheduled Prospecting: Configurar pg_cron job

## Fase 4 — Meta Ads & SDR
- Meta Ads: Substituir placeholder por guia de configuração com token manual
- SDR Agent: Garantir que o fluxo autônomo funciona com cron + WhatsApp

## Fase 5 — Infraestrutura
- PWA/Push: Adicionar geração de VAPID keys e configuração
- Billing: Verificar e corrigir links de checkout Cakto
