# Monlebu Cookies — landing page

Site estático, sem build e sem dependências. Sobe direto em Vercel, Netlify, GitHub Pages,
Cloudflare Pages ou qualquer hospedagem comum: basta jogar a pasta inteira na raiz.

```
index.html
assets/
  css/style.css
  js/main.js
  fonts/        Bodoni Moda, Jost, Pinyon Script (auto-hospedadas, 112 KB)
  img/          fotos dos 8 cookies + ambiente + disco + logo + favicon
  video/        hero.mp4, hero.webm, hero-mobile.mp4
```

---

## O que mudou nesta revisão

### Cliques que não levavam a lugar nenhum

- **O menu mobile cobria o site inteiro, invisível, no desktop.** Era o bug mais grave: o CSS
  declarava `display:flex` no painel, o que anula o atributo `hidden` do HTML. Resultado: uma
  camada transparente em tela cheia capturava *todos* os cliques da página — quem clicava no
  meio do hero acertava, sem ver, um link do menu. Corrigido com `.drawer[hidden]{display:none}`.
- **Âncoras caíam atrás da barra fixa.** O topo de cada sala ficava escondido sob a navegação.
  Agora o JS mede a altura real da barra e alimenta `--nav-h`, e o CSS usa isso em
  `scroll-padding-top` e `scroll-margin-top`.
- **Os cookies da Sala II não eram clicáveis.** Uma galeria em que nada responde ao clique é
  incoerente. Cada peça virou link para o cardápio, com a chamada "Ver no cardápio ↗" — que
  aparece no hover e fica **sempre visível no celular**, onde hover não existe.
- **O link "pular para o conteúdo" pulava o hero inteiro**, caindo na Sala I. Agora vai para o
  começo do conteúdo.
- **O logotipo levava a uma âncora**, o que parava a rolagem no lugar errado. Agora sobe ao topo.
- **A coluna "Horário" do rodapé parecia links** (mesmo tamanho e cor dos itens ao lado) e não
  clicava em nada. Ganhou estilo próprio de informação. Os links de verdade ganharam "↗".
- **Media query inválida** (`sizes="(max:900px)"`, faltando o `-width`) fazia o navegador baixar
  a imagem errada.

### Animações de seção

- **As revelações ao rolar não dependem mais de `requestAnimationFrame`.** Antes, se os quadros
  fossem represados — aba em segundo plano, economia de bateria, webview do Instagram — seções
  inteiras podiam ficar **permanentemente invisíveis**. Agora uma varredura por tempo garante que
  nada fique escondido, inclusive quando alguém desce a página num único gesto rápido.
  Só os botões magnéticos seguem em `requestAnimationFrame`: é enfeite, e um quadro perdido
  ali não esconde conteúdo.
- **O menu mobile abria com opacidade 0** pelo mesmo motivo. Trocado por reflow síncrono.
- **A quebra de linha dos títulos** era calculada antes das fontes carregarem, então as linhas
  saíam agrupadas errado. Agora refaz em `document.fonts.ready`.
- **O preloader travava a página se o JS falhasse.** Ganhou uma saída em CSS puro (4s) e um
  bloco `<noscript>`.
- Hover só se aplica onde existe hover (`@media (hover:hover)`), acabando com o "hover grudado"
  no toque. O grão de filme para de animar no celular.
- Barra do cupom: a escolha de fechar agora é lembrada.
- A sala atual fica destacada no menu enquanto se rola.

### O disco (Sala III)

O vinil antigo era uma foto retangular forçada dentro de um círculo — o recorte cortava o
rótulo no meio da palavra. Trocado pela **arte circular da marca**, na versão com o rótulo
correto ("MONLEBU", e não "MONEBU"). Gira inteiro, como um disco de verdade, e **gira o
tempo todo** — não depende da música estar tocando.

O PNG entregue tinha 1278 × 1230 px, com o disco levemente achatado e encostando nas bordas
de cima e de baixo. Girar aquilo mostraria duas arestas retas passando. Então o disco foi
medido por opacidade (ignorando a sombra), recortado num quadrado centrado no seu centro
real e mascarado num círculo perfeito antes de virar `disco-lg.webp` / `disco-md.webp`.
Perde-se ~1% da borda externa; o giro fica redondo.

Os arquivos `vinil-md.webp` e `vinil-lg.webp` saíram por não serem mais usados.

### Imagens fixas

O parallax saiu do site inteiro — imagens da Sala I, da coleção, da Sala IV e do fechamento
agora ficam paradas, sem deslocamento nem entrada ao rolar. O código de parallax foi removido
do CSS e do JS, não apenas desligado. As revelações de **texto** continuam.

### Marca em evidência

O selo pequeno que ficava acima do título do hero saiu. Em troca, a logo da barra de navegação
passou de 26 px para **até 68 px**, com brilho dourado e a assinatura "cookies" em Pinyon
Script abaixo do nome. A altura da barra é medida sozinha, então nada quebrou com a mudança.

### Sala IV: de "Visite" para "Pedidos"

Não existe local físico para visitar — só retirada rápida e entrega. Então o convite saiu
do site inteiro:

- o título "Visite a casa" virou **"Como pedir a sua"**;
- o item de menu "Visite" virou **"Pedidos"**, na barra, na gaveta e no rodapé;
- a âncora `#visite` virou `#pedidos` (e as classes CSS acompanharam);
- os quatro dados da sala deixaram de ser *Horário / Onde / Como / Cupom* e passaram a
  **Horário / Retirada / Entrega / Cupom**, que é o que de fato existe.

A metáfora das "salas" continua: ela organiza o site, não promete um endereço para conhecer.

### O vídeo do hero

O fundo estava com qualidade abaixo do resto do site, e o motivo era o **encode**, não a
foto: 1600 × 900 a **393 kb/s** é bitrate baixíssimo, e em imagem escura isso vira blocagem
e faixas nos degradês. O still de origem sempre foi nítido.

Refiz o movimento a partir do próprio still, em alta:

- zoom lento com deriva suave, ambos em curva cosseno/seno de período igual à duração — a
  posição **e a velocidade** coincidem no início e no fim, então o `loop` do `<video>` não
  dá salto nem sensação de rebobinar;
- 12 s a 24 fps, sem áudio;
- H.264 CRF 20 (**1072 kb/s**, 2,7× o anterior) e VP9 CRF 26 para o WebM.

Medindo o primeiro quadro de cada vídeo contra o still original:

| | SSIM | PSNR |
|---|---|---|
| antes | 0,935 | 40,5 dB |
| agora (mp4) | **0,958** | **43,8 dB** |
| agora (webm) | 0,952 | 43,3 dB |

+3,3 dB de PSNR é cerca de metade do erro de antes. A costura do loop tem diferença média
de 0,88/255 entre o primeiro e o último quadro — invisível.

O vídeo pesa 1,6 MB (mp4) e 0,6 MB (webm). Como o WebM vem primeiro na lista de fontes,
Chrome e Firefox baixam só os 0,6 MB.

### A coleção — 8 criações autorais

A Sala II foi refeita com as **fotos oficiais** e os cookies reais da casa. Cada foto foi
conferida uma a uma para casar com o cookie certo (o pistache pelo recheio verde, a Bala
Baiana pelos flocos de coco e amêndoas, o Trio Chocolat pela massa preta com recheio branco,
e assim por diante).

| Cookie | Peso | Preço |
|---|---|---|
| Monlebu — *assinatura, red velvet com brigadeiro de cream cheese* | 100 g | R$ 18,00 |
| Pistachio — *pistache triturado e chocolate branco nobre* | 100 g | R$ 23,00 |
| Chocolat Noir — *100% cacau belga, recheio 40% cacau* | 100 g | R$ 16,00 |
| Kinder — *baunilha com recheio de Kinder Bueno* | 100 g | R$ 21,00 |
| Bala Baiana — *leite de coco, caramelo, coco e amêndoas* | 105 g | R$ 18,00 |
| Nutella — *amanteigada com Nutella pura* | 90 g | R$ 17,00 |
| Trio Chocolat — *cacau black com chocolate branco nobre* | 100 g | **sem preço** |
| Limone — *baunilha, limão siciliano e chocolate branco* | 80 g | R$ 15,00 |

> ⚠️ **O Trio Chocolat veio sem preço.** Está no ar como "no cardápio" no lugar do valor —
> não fica com um buraco na grade, mas também não inventa um número. Me passe o valor que eu
> troco. Fica em `index.html`, procure por `cartel__price--ask`.

A grade é limpa: **4 colunas** no desktop, 3 até 1180 px, 2 até 860 px e 1 no celular — sempre
fileiras completas, sem sobra. A linha de peso e preço de cada card é empurrada para a base,
então os preços **alinham entre si** dentro da mesma fileira.

As fotos têm fundo branco, então tirei o escurecimento e a vinheta que a moldura aplicava —
branco de foto de produto tem que continuar branco. As seis fotos antigas de cookies foram
removidas.

## A trilha do Spotify

**Nada toca sozinho.** A música só começa se o visitante apertar o play.

Isso é decisão de projeto, não limitação de esforço: o embed do Spotify roda numa moldura de
outro domínio e **não existe API que deixe o site ajustar o volume dela**. Sem controle de
volume, começar sozinha significa começar no volume em que o aparelho estiver — que foi
exatamente o que aconteceu no teste: estourado. Melhor a pessoa escolher.

O que o site faz quando ela escolhe:

- um **controle de pausa** aparece no canto inferior direito e acompanha a rolagem pelas salas;
- dá para **dispensar** o controle no "×", e o site não insiste de novo na mesma visita.

O disco da Sala III gira sempre, independente da música.

Se um dia quiser que comece sozinha, o ajuste está na primeira dúzia de linhas do
`assets/js/main.js`:

```js
var TRILHA = {
  autostart: 'off',   // 'off' | 'sala' | 'gesto'
  playlist: '1uchC57iReiHSt9jHB1esq'
};
```

- `'off'` — só no play do visitante (**padrão**)
- `'sala'` — começa ao chegar na Sala III
- `'gesto'` — começa no primeiro clique/toque em qualquer lugar

Nos dois últimos casos vale lembrar: os navegadores só liberam áudio depois de um clique ou
toque do visitante, e **o volume continua sendo o do aparelho**.

**Uma observação sobre o embed:** quem não está logado no Spotify ouve **prévias de 30 segundos**
(aparece a etiqueta "Prévia" no player). Quem está logado ouve as faixas inteiras. Isso é regra
do Spotify e vale para qualquer site.

Se a ideia for som ambiente de verdade, com volume sob controle, o caminho é hospedar um arquivo
de áudio próprio (com a licença resolvida) em vez do embed. Me avise que eu monto.

---

## Responsivo

Testado de **320 px a 1440 px**, retrato e paisagem, sem nenhum overflow horizontal.

- Menu vira gaveta abaixo de 860 px, com rolagem própria, foco preso dentro dela e trava de
  rolagem no corpo que **não perde a posição** ao fechar (o jeito antigo pulava para o topo no iOS)
- Coleção: 4 colunas → 3 → 2 → 1, sempre em fileiras completas
- Player do Spotify entra em modo compacto (152 px) até 560 px
- Em tela baixa e deitada (celular na horizontal) o hero encolhe para não cortar os botões
- `env(safe-area-inset)` respeitado no entalhe do iPhone
- Alvos de toque com no mínimo 44 px

---

## Trocar o vídeo do hero

Se a Monlebu gravar um vídeo próprio, é só substituir os arquivos em `assets/video/`
mantendo os nomes:

- `hero.mp4` + `hero.webm` — 16:9, usado no desktop
- `hero-mobile.mp4` — 9:16, usado abaixo de 700 px de largura
- `assets/img/hero-poster.webp` e `hero-poster-mobile.webp` — primeiro quadro

Dica: entre 12 e 20 segundos, sem áudio, com o último quadro igual ao primeiro para o loop não
dar salto — e **não economize no bitrate**: abaixo de ~800 kb/s em 1600 × 900 a imagem escura
começa a bandear. O vídeo não carrega para quem pediu movimento reduzido ou economia de dados.

Se um dia quiser trocar por um vídeo real da cozinha, é só substituir mantendo os nomes.

---

## O que já está ligado

- **Pedido online** → `link.comanda10.com.br/estabelecimento/monlebu/produtos`
  (barra, hero, cada um dos 8 cookies, Sala II, Sala IV, fechamento, rodapé)
- **Instagram** → `@monlebucookies`
- **Playlist** → embed do Spotify + link para abrir no app
- **Aberto/fechado** — calculado no fuso de São Paulo (Qua–Dom, 12h–18h), independente de onde o
  visitante estiver, e **revira sozinho de minuto em minuto** (antes só calculava no carregamento).
  Para mudar: `assets/js/main.js`, bloco `hours()`, constantes `OPEN_DAYS`, `FROM` e `TO`.
  Mude também o texto da Sala IV e o `schema.org` no `<head>`.
- **Cupom MONLEBU10** — barra fixa no topo, Sala IV e chamada final.

---

## Antes de publicar

Troque `https://monlebucookies.com.br/` pelo domínio real em `index.html`. Aparece em
`canonical`, `og:url`, `og:image`, `twitter:image` e no JSON-LD. As imagens de compartilhamento
**já estão em URL absoluta** (era relativa, e por isso o preview não aparecia no WhatsApp).

---

## Acessibilidade

- Todas as imagens com `alt` descritivo; `srcset` em 2 tamanhos
- Cada cookie é um card inteiro clicável, com nome, descrição, peso e preço no nome acessível
- Foco visível, link "pular para o conteúdo", gaveta com `aria-modal`, foco preso e Esc
- Sala atual marcada com `aria-current`; horário anunciado com `role="status"`
- `prefers-reduced-motion` desliga grão, marquee, disco e revelações
- Sem `requestAnimationFrame` em nada que esconda conteúdo

---

## Direção de arte

**Conceito:** confeitaria que se comporta como galeria. As quatro seções são "salas" (I a IV),
os cookies estão pendurados em molduras douradas com etiqueta de museu, e o selo de cera da
marca é o divisor recorrente.

**Cores** — noir `#0B0908` · bordô `#6E2A29` (tirado da própria embalagem) ·
latão `#C0964C` (tirado do medalhão) · creme `#F1E9DC`

**Tipos** — Bodoni Moda (didone, mesma lógica do logotipo) · Jost (geométrica, herdeira da
Futura de 1927) · Pinyon Script (eco da assinatura "cookies")

---

Feito por **LRGZ** · [lrgz.com.br](https://lrgz.com.br)
