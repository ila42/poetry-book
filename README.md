# Просто человеком — стихи Андрея Балашова

Интерактивный сайт-книга со стихами Андрея Балашова (р. 1965). Четыре поэтических сборника в формате листающейся книги с аудиочтением, поиском, избранным и панелью администратора.



---

## Стек

| Слой | Технологии |
|------|-----------|
| UI | React 18, TypeScript |
| Анимации | Framer Motion, React PageFlip |
| Стили | Tailwind CSS (темы: leather, burgundy, parchment) |
| Шрифты | Crimson Text, Playfair Display (Google Fonts) |
| Роутинг | React Router DOM 7 |
| Сборка | Vite 6 |
| Тесты | Vitest |
| Email | EmailJS |
| Деплой | Vercel |

---

## Быстрый старт

```bash
npm install
```

Скопируй `env.example.txt` в `.env` и заполни переменные (см. [Настройка окружения](#настройка-окружения)).

```bash
npm run dev       # dev-сервер с горячей перезагрузкой
npm run build     # production-сборка
npm run preview   # предпросмотр production-сборки
```

---

## Возможности

### Читалка книг
- Листание страниц с 3D-анимацией (React PageFlip)
- Один лист на мобильном, разворот на десктопе
- Регулировка размера шрифта (14–22 px, сохраняется в localStorage)
- Свайп и клик по краю страницы для навигации

### Контент
- 4 сборника, 245+ стихотворений
- Поиск по названию стихотворения
- Избранное (localStorage)
- Аудиочтение со встроенным плеером
- Стихотворение дня

### Прочее
- Полное оглавление с поиском и сворачиваемыми разделами
- Архив аудиозаписей
- Контактная форма (EmailJS) с авторепли
- SEO: Open Graph, JSON-LD, sitemap.xml, robots.txt

---

## Сборники

| № | Название | Слаг |
|---|----------|------|
| 1 | Просто человеком | `book-1` |
| 2 | 6 тетрадей сборник | `book-2` |
| 3 | Вне времени | `book-3` |
| 4 | Восточные тетради | `book-4` |

Данные каждой книги хранятся в `src/data/content-book-N.json` и `src/data/toc-book-N.json`.

---

## Структура проекта

```
poetry-book-clean/
├── public/
│   ├── audio/          # MP3/M4A — аудиозаписи стихотворений
│   └── images/         # Обложки, фото автора, текстуры
│
├── src/
│   ├── admin/          # Защищённая панель администратора
│   ├── components/
│   │   ├── AudioPlayer/    # Глобальный и встроенный плеер
│   │   ├── Book/           # Ядро: Book, BookPage, PoemPage
│   │   ├── ContactForm/    # Форма с EmailJS
│   │   ├── ReaderTocPanel/ # Боковое оглавление в ридере
│   │   └── TopToolbar/     # Панель управления читалкой
│   ├── context/        # SearchContext и контексты админки
│   ├── data/           # JSON-данные книг и TypeScript-конфиги
│   ├── hooks/          # Свайп, клик по краю, скроллбар
│   ├── pages/          # LandingPage, BookReader, AudioArchive и др.
│   └── types/          # TypeScript-интерфейсы (Poem, Chapter, Author…)
│
├── scripts/            # Node-скрипты: парсинг .docx, QA-проверки
├── vercel.json         # SPA rewrite для Vercel
└── env.example.txt     # Шаблон переменных окружения
```

---

## Панель администратора

Доступна по адресу `/#/admin`. Требует пароль из переменной `VITE_ADMIN_PASSWORD`.

Возможности: редактирование стихотворений, управление структурой книг, редактор биографии автора, файловый менеджер (аудио и изображения).

---

## Настройка окружения

Скопируй `env.example.txt` в `.env`:

```env
VITE_ADMIN_PASSWORD=your_password

VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=main_template_id
VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID=autoreply_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

