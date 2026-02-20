# Иконки для футера

Положите свои SVG-файлы в эту папку и укажите путь в `index.html`:

- `telegram.svg` — иконка Telegram
- `email.svg` — иконка почты

**Как добавить свои SVG:**
1. Сохраните файл в эту папку (например, `my-icon.svg`)
2. В `index.html` укажите: `<img src="/static/img/icons/my-icon.svg" alt="..." class="footer__icon">`

**Рекомендации для SVG:**
- viewBox: `0 0 24 24` (или квадрат) — размер задаётся в CSS
- Цвет: `stroke="rgba(255,255,255,0.7)"` для тёмного фона или `currentColor` для наследования
- Размер в CSS: 24×24px (десктоп), 20×20px (мобилка)
