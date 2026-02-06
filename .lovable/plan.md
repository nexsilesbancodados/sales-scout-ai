

# Plano: Configurar Secrets da Evolution API

## Resumo
Atualizar os secrets do Supabase com as credenciais corretas da Evolution API hospedada na VPS do usuário para resolver o erro 401 Unauthorized.

## Alterações Necessárias

### 1. Atualizar Secrets no Supabase

| Secret | Valor |
|--------|-------|
| `EVOLUTION_API_URL` | `https://gusta-evolution-api.xo6mnm.easypanel.host` |
| `EVOLUTION_API_KEY` | `429683C4C977415CAAFCCE10F7D57E11` |

### 2. Reimplantar Edge Function

Após atualizar os secrets, a Edge Function `whatsapp-connect` será reimplantada automaticamente para utilizar as novas credenciais.

## Resultado Esperado

Após a configuração:
1. Usuários poderão clicar em "Conectar WhatsApp"
2. O sistema criará uma instância única para cada usuário (`prospecte_{user_id}`)
3. Um QR Code será exibido para o usuário escanear
4. Após escanear, o WhatsApp será conectado e webhooks configurados automaticamente

## Detalhes Técnicos

A Edge Function `whatsapp-connect` utiliza esses secrets para:
- Autenticar com a Evolution API usando o header `apikey`
- Criar instâncias via `POST /instance/create`
- Obter QR codes via `GET /instance/connect/{instanceName}`
- Verificar status via `GET /instance/connectionState/{instanceName}`
- Configurar webhooks para receber mensagens

