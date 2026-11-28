# Acervo Maker STL — Área de Membros

Área de membros estática para entrega e organização de arquivos STL/3MF/ZIP hospedados no Google Drive.

## Estrutura do Projeto

- `index.html` — Estrutura principal da área de membros
- `styles.css` — Estilização responsiva (desktop e mobile)
- `app.js` — Renderização dinâmica, filtros, busca e aviso de atualização
- `data/catalog.js` — Configuração central de categorias, módulos, contadores, aviso e links
- `assets/covers/` — Capas das coleções e modelos (`.jpg` e `.svg`)
- `vercel.json` — Configuração de deploy estático na Vercel

## Deploy na Vercel via GitHub

1. Suba esta pasta para um repositório no GitHub.
2. Acesse a Vercel, clique em **Add New Project** e importe o repositório.
3. Mantenha o **Framework Preset** como `Other` (a Vercel usará o `vercel.json` automaticamente) e clique em **Deploy**.
