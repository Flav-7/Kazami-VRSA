# Kazami VRSA

Site do **Kazami Sushi Marina** — Vila Real de Santo António.

- **Intro:** vídeo do ninja a cortar sashimi + barra de carregamento ligada ao carregamento real do site.
- **Página principal:** hero com a fachada, menu por categorias, pedido à mesa por QR, galeria, mapa (Google Maps estilizado) e reservas.

## Correr localmente

```bash
python -m http.server 5510
```

Abrir http://localhost:5510 (`?skip` salta a intro).

## Estrutura

| Pasta / ficheiro | O quê |
| --- | --- |
| `index.html` | intro + página |
| `css/style.css` | intro |
| `css/site.src.css` | página (unidade `u` = 1px do design de 1024px) |
| `css/site.css` | **gerado** — `node build-css.js` |
| `js/intro.js` | loader, velocidade do vídeo |
| `js/site.js` | menu (dados em `MENU`), galeria, header |
| `assets/` | vídeo da intro, fotos e fundos |
