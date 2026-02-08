

# Importar Leads do WhatsApp

Adicionar funcionalidade para extrair contatos diretamente de grupos do WhatsApp conectado, permitindo prospectar leads sem usar APIs externas de busca.

## O que será criado

Uma nova seção na aba de **Importar** que permite:
1. Listar todos os grupos do WhatsApp conectado
2. Selecionar quais grupos deseja importar
3. Extrair automaticamente os participantes como leads
4. Importar em lote para o sistema

## Benefícios

- **100% Gratuito**: Não usa créditos de APIs externas
- **Leads Qualificados**: Pessoas já engajadas em grupos do seu nicho
- **Rápido**: Importação instantânea de centenas de contatos
- **Sem Limite**: Importe quantos contatos quiser

## Fluxo do Usuário

```text
+--------------------------------------------------+
|                   FLUXO DE USO                   |
+--------------------------------------------------+
|                                                  |
|  1. Usuário vai para Prospecção > Importar       |
|                    |                             |
|                    v                             |
|  2. Clica em "Importar do WhatsApp"              |
|                    |                             |
|                    v                             |
|  3. Sistema lista todos os grupos                |
|     [x] Grupo Empresários SP (234 membros)       |
|     [x] Marketing Digital (156 membros)          |
|     [ ] Família (12 membros)                     |
|                    |                             |
|                    v                             |
|  4. Usuário seleciona grupos e clica "Importar"  |
|                    |                             |
|                    v                             |
|  5. Contatos são salvos como leads               |
|     - Nome do participante                       |
|     - Número de telefone                         |
|     - Grupo de origem (como tag)                 |
|                                                  |
+--------------------------------------------------+
```

## Detalhes Técnicos

### 1. Nova Edge Function: `whatsapp-groups`

Cria função para buscar grupos e participantes usando a Evolution API:

| Endpoint Evolution API | Ação |
|------------------------|------|
| `GET /group/fetchAllGroups/{instance}` | Lista todos os grupos |
| `GET /group/participants/{instance}?groupJid={jid}` | Lista participantes |

Ações suportadas:
- `list_groups` - Retorna lista de grupos com nome e quantidade de membros
- `get_participants` - Retorna participantes de grupos selecionados

### 2. Atualização do Frontend: `ImportTab.tsx`

Adiciona nova seção com:
- Botão "Importar do WhatsApp"
- Modal com lista de grupos (checkbox para seleção múltipla)
- Contador de membros por grupo
- Opção de definir nicho/tag para os leads importados
- Barra de progresso durante importação
- Filtro para excluir grupos pessoais/família

### 3. Atualização da Biblioteca: `src/lib/whatsapp.ts`

Novas funções:
- `fetchWhatsAppGroups()` - Lista grupos disponíveis
- `fetchGroupParticipants(groupIds: string[])` - Busca participantes

### 4. Integração com Leads

Os contatos importados terão:
- `source`: `whatsapp_group`
- `niche`: Nome do grupo ou nicho definido pelo usuário
- `stage`: "Contato"
- `temperature`: "frio"

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/whatsapp-groups/index.ts` | Criar (nova edge function) |
| `supabase/config.toml` | Adicionar configuração da função |
| `src/lib/whatsapp.ts` | Adicionar funções de grupos |
| `src/components/prospecting/ImportTab.tsx` | Adicionar seção WhatsApp |

## Requisitos

- WhatsApp deve estar conectado na plataforma
- Evolution API configurada com as credenciais

## Interface Visual

A aba de Importar terá duas opções principais:

```text
+-----------------------------------------------+
|              IMPORTAR LEADS                   |
+-----------------------------------------------+
|                                               |
|  +------------------+  +------------------+   |
|  |                  |  |                  |   |
|  |   📁 Arquivo     |  |   📱 WhatsApp    |   |
|  |      CSV         |  |     Grupos       |   |
|  |                  |  |                  |   |
|  +------------------+  +------------------+   |
|                                               |
+-----------------------------------------------+
```

Ao clicar em "WhatsApp Grupos":

```text
+-----------------------------------------------+
|     IMPORTAR CONTATOS DO WHATSAPP             |
+-----------------------------------------------+
|                                               |
|  Selecione os grupos para importar:           |
|                                               |
|  [x] Grupo Empresários SP       234 membros   |
|  [x] Marketing Digital BR       156 membros   |
|  [ ] Vendas Online             89 membros     |
|  [ ] Networking Profissional   312 membros    |
|                                               |
|  Nicho (opcional): [________________]         |
|                                               |
|  Total selecionado: 390 contatos              |
|                                               |
|  [Cancelar]              [Importar Contatos]  |
|                                               |
+-----------------------------------------------+
```

