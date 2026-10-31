# Unibangalos – Quiz (Filtro + Cadastro)

Endereço: **https://unibangalos.tribuzz.com.br**

| Página | Arquivo | Eventos Meta (Pixel 636846751474620) |
|---|---|---|
| Filtro | `index.html` | `PageView`, `clicou_turismo` ou `clicou_corretor` (eventos personalizados) |
| Cadastro | `cadastro.html` | `PageView`, `Lead` (ao clicar em Enviar com os dados válidos) |

Os leads vão para a planilha **Leads - Unibangalos**, na pasta *Leads* do Google Drive:
https://docs.google.com/spreadsheets/d/1Lr3Y-7vigOVVwJllh20IivSSD5XKCE2L54bhHx5JX6s/edit

Colunas: Data/Hora, Nome, Email, Telefone, Objetivo, UTMs, fbclid, Página.

## 1. Ligar a planilha (Apps Script) – uma vez só

1. Abra a planilha acima e vá em **Extensões > Apps Script**.
2. Apague o conteúdo e cole o arquivo `apps-script/Code.gs`. Salve.
3. Clique em **Implantar > Nova implantação**, tipo **App da Web**:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Autorize o acesso e copie a **URL do app da Web** (termina em `/exec`).
5. Cole essa URL em `assets/config.js`, no campo `SHEETS_WEBAPP_URL`.

> Se alterar o `Code.gs` depois, use **Implantar > Gerenciar implantações > Editar > Nova versão** para manter a mesma URL.

## 2. Publicar no subdomínio

O site é estático (HTML/CSS/JS), qualquer hospedagem serve. Este repositório já está na estrutura de raiz do site.

**Opção A – Netlify / Vercel:** importe o repositório e deixe o diretório de publicação na raiz (sem build). Adicione o domínio `unibangalos.tribuzz.com.br` no painel.

**Opção B – GitHub Pages (recomendado, já está tudo pronto):** em Settings > Pages, escolha "Deploy from a branch", branch `main`, pasta `/ (root)`. O arquivo `CNAME` já está configurado com o domínio.

**DNS (no painel onde o tribuzz.com.br está registrado):** crie um registro

| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `unibangalos` | endereço indicado pela hospedagem (ex.: `seu-site.netlify.app` ou `jefftribuzz.github.io`) |

## 3. Testar

- Use o **Meta Pixel Helper** (extensão do Chrome) ou **Gerenciador de Eventos > Testar eventos**.
- Clique numa opção do filtro → deve aparecer `clicou_turismo` ou `clicou_corretor`.
- Envie o cadastro → deve aparecer `Lead` e uma nova linha na planilha.
- Para usar os eventos personalizados em campanhas, crie **Conversões personalizadas** no Gerenciador de Eventos a partir de `clicou_turismo` e `clicou_corretor`.
