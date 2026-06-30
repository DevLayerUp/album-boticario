# Imagens de fundo da dashboard

Coloque aqui as imagens de fundo do hero e dos feature cards. Enquanto um
arquivo não existir, o componente renderiza um fallback colorido pelo tema —
então a UI funciona normalmente antes de você importar as imagens reais.

Os caminhos são centralizados em `lib/dashboard-assets.ts`. Para trocar uma
imagem, basta substituir o arquivo (mantendo o nome) ou editar o caminho no mapa.

## Arquivos esperados

```
hero.png            → banner do topo
logo.png            → logotipo "Fãs por Natureza" do header
cards/figurinha.png → card "Minha figurinha"  (tema verde)
cards/album.png     → card "Meu Álbum"         (tema azul)
cards/colecao.png   → card "Coleção"           (tema gold)
cards/pacotinhos.png→ card "Pacotinhos"        (tema gold)
cards/quiz.png      → card "Quizz"             (tema verde)
cards/missoes.png   → card "Missões"           (tema azul)
cards/trocas.png    → card "Trocas"            (tema verde)
album/bg-esquerdo.png → blobs decorativos da página esquerda do álbum
album/bg-direito.png  → blobs decorativos da página direita do álbum
```

Recomendado: PNG/WebP, headers de card ~ 600×460px, hero ~ 1200×420px.
