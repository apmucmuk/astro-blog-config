# Универсальное ядро Astro-блога --- техническое задание

**Статус:** рабочая спецификация / living specification\
**Назначение:** основной источник требований для Codex и дальнейшей
разработки\
**Первый проект:** tragarze.pl\
**Модель:** клонируемый репозиторий, независимые темы проектов,
переиспользуемое техническое ядро

> Важно: язык этого технического документа --- русский. Это не
> определяет язык интерфейса сайта. Первый проект tragarze.pl имеет
> польский пользовательский интерфейс и польский контент. Архитектура с
> первого дня должна поддерживать любое количество языков, даже если
> конкретный проект использует только один.

------------------------------------------------------------------------

# Навигация по спецификации

Нумерация top-level разделов является **stable reference ID**, а не
иерархией важности. Существующие номера не меняются ради косметической
последовательности: это сохраняет cross-references внутри living specification.

Исторический пропуск `30–31` остаётся зарезервированным. Новые небольшие
требования сначала добавляются в логически подходящий существующий раздел;
новый top-level ID создаётся только для самостоятельного contract domain.

## Полное кликабельное оглавление

### I. Foundation — архитектура, контент и routing

- [1. Цель](#section-1)
- [2. Архитектурные слои](#section-2)
- [3. Модель клонирования](#section-3)
- [4. Стек](#section-4)
- [5. Static-first и минимальный JavaScript](#section-5)
- [6. Структура репозитория](#section-6)
- [7. CORE](#section-7)
- [8. FEATURES](#section-8)
- [9. THEME](#section-9)
- [10. Первый проект: tragarze.pl](#section-10)
- [11. PROJECT config](#section-11)
- [12. Многоязычность обязательна архитектурно](#section-12)
- [13. Полный i18n](#section-13)
- [14. Идентичность переводов](#section-14)
- [15. Стабильный ID статьи](#section-15)
- [16. UI-переводы](#section-16)
- [17. Content Collections и MDX](#section-17)
- [18. Routing](#section-18)

### II. Publication UI & Content Experience

- [19. Layout принадлежит THEME](#section-19)
- [20. Превью статьи: progressive metadata disclosure](#section-20)
- [21. Share](#section-21)
- [22. SEO и скрытые метаданные](#section-22)
- [29. Static и dynamic metadata](#section-29)
- [33. Mobile-first](#section-33)
- [34. Touch targets](#section-34)
- [35. Typography](#section-35)
- [36. CSS](#section-36)
- [37. Images](#section-37)
- [38. Fonts](#section-38)
- [39. JS budget](#section-39)
- [40. Islands](#section-40)
- [41. ToC](#section-41)
- [42. Progressive enhancement](#section-42)
- [51. Accessibility](#section-51)
- [52. SEO](#section-52)
- [53. Multilingual SEO](#section-53)
- [54. Sitemap и RSS](#section-54)
- [55. Related/internal linking](#section-55)
- [56. Dates](#section-56)
- [57. No-JS](#section-57)
- [66. Motion](#section-66)
- [67. Порядок приоритетов UX](#section-67)
- [68. Future-proofing без переусложнения](#section-68)
- [73. Пользовательская страница 404 --- обязательная функция](#section-73)
- [74. Content Discovery, сортировка публикаций и пагинация](#section-74)
- [75. Рейтинг статьи --- обязательный v1-контракт](#section-75)
- [76. Contract-first policy для разработки и Codex](#section-76)
- [77. Контракт поиска](#section-77)
- [78. Hydration и progressive enhancement](#section-78)
- [79. TOC contract](#section-79)
- [80. Structured Data contract](#section-80)

### III. Runtime Features & Data

- [23. Чтения: максимально простой backend](#section-23)
- [24. Когда засчитывается прочтение](#section-24)
- [25. Минимизация идентификации и логики reads](#section-25)
- [26. Что хранит backend для reads](#section-26)
- [27. Deduplication чтений](#section-27)
- [28. Публичная статистика reads](#section-28)
- [32. Comments](#section-32)
- [43. Worker](#section-43)
- [44. Multi-project backend](#section-44)
- [45. API abstraction](#section-45)
- [46. Security](#section-46)
- [47. CORS](#section-47)
- [48. Request budget](#section-48)
- [81. Leads/forms contract](#section-81)
- [82. Cache contract](#section-82)
- [83. API conventions](#section-83)
- [84. Deploy adapter contract](#section-84)
- [85. Канонический D1 Data Model](#section-85)
- [112. Runtime Content Registry & Article Lifecycle](#section-112)
- [113. Aggregate Initialization & Snapshot Ownership](#section-113)
- [114. Dynamic Sorting & Static Pagination Delivery](#section-114)
- [115. API Deployment, Visitor Cookie & Credentialed CORS](#section-115)
- [116. Comment Publication Invariants](#section-116)
- [117. D1 Migrations, Backup, Restore & Rollback](#section-117)
- [118. Observability, Privacy & Retention](#section-118)

### IV. Engineering, Delivery & Contracts

- [49. Core Web Vitals](#section-49)
- [50. Lighthouse](#section-50)
- [58. TypeScript](#section-58)
- [59. Dependencies](#section-59)
- [60. Code quality](#section-60)
- [61. Build scripts](#section-61)
- [62. Tests](#section-62)
- [63. Environment](#section-63)
- [64. Documentation](#section-64)
- [65. Git и reusable-проверка](#section-65)
- [69. Порядок разработки Codex](#section-69)
- [70. Definition of Done](#section-70)
- [71. Финальный технический аудит](#section-71)
- [72. Правило living specification](#section-72)
- [86. Contract-hardening Definition of Done](#section-86)
- [87. Руководство по поэтапной реализации и настройке сервисов](#section-87)
- [88. Финальный SEO / Performance / UX Gate перед production](#section-88)
- [89. Dependency Boundaries и ownership contract](#section-89)
- [90. URL Normalization и duplicate-control contract](#section-90)
- [91. Performance Budgets](#section-91)
- [92. Mobile Interaction Contract](#section-92)
- [93. Codex Stage Gates](#section-93)
- [94. Shared Runtime/API Contracts](#section-94)
- [95. Security Contract](#section-95)

### V. Visual, Responsive & Browser Contract

- [96. Visual Design Direction](#section-96)
- [97. CSS Architecture](#section-97)
- [98. Design Tokens](#section-98)
- [99. Color Schemes](#section-99)
- [100. Typography System](#section-100)
- [101. Layout & Grid](#section-101)
- [102. Editorial Cards](#section-102)
- [103. Article / Editorial Visual Contract](#section-103)
- [104. Component Visual States](#section-104)
- [105. Responsive Design Contract](#section-105)
- [106. Visual Anti-patterns](#section-106)
- [107. Design / CSS Definition of Done](#section-107)
- [108. Browser Behavior & Platform Quirks](#section-108)
- [109. Scroll, Viewport & Browser Chrome Contract](#section-109)
- [110. Portrait & Landscape Contract](#section-110)
- [111. Browser Workaround & Compatibility Gate](#section-111)
- [119. Accessibility, Robots, Browser Metadata & HTTP Delivery Baseline](#section-119)

## Правило чтения для Codex

Оглавление является навигацией, но authoritative contract находится в
конкретном numbered section. При конфликте краткого описания/примера с
нормативным contract применяется более специализированный authoritative
section и правила Contract-first policy.

------------------------------------------------------------------------

<a id="section-1"></a>
# 1. Цель

Создать с нуля production-ready основу для современных контентных сайтов
и блогов на Astro.

Это **не универсальная визуальная тема** и не CMS с набором
переключаемых шаблонов.

Репозиторий должен клонироваться для нового проекта, после чего проект
может независимо менять:

-   дизайн;
-   Astro layouts;
-   Astro components;
-   CSS;
-   React islands;
-   структуру превью и статьи;
-   навигацию;
-   категории;
-   брендинг;
-   языки;
-   SEO-стратегию;
-   проектные функции;
-   контент.

Переиспользуется только то, что действительно является общей технической
инфраструктурой.

Первый production-проект --- **tragarze.pl**, но CORE не должен
содержать бизнес-логику или дизайн tragarze.pl.

------------------------------------------------------------------------

<a id="section-2"></a>
# 2. Архитектурные слои

Основная модель:

``` text
CORE
↓
FEATURES
↓
THEME
↓
PROJECT
```

Роли:

``` text
CORE
- Content Collections и общая работа с контентом
- i18n
- SEO
- routing helpers
- API contracts/client primitives
- общие types
- validation
- generic utilities

FEATURES
- reads / статистика чтений
- comments
- search
- будущие независимые функциональные модули

THEME
- layouts
- визуальные Astro-компоненты
- визуальные React-компоненты
- typography
- spacing
- colors
- states
- CSS
- icons/assets
- mobile presentation

PROJECT
- site config
- languages
- feature flags
- navigation
- SEO config
- конкретные проектные решения
```

Разрешённая зависимость:

``` text
PROJECT → THEME → FEATURES → CORE
```

CORE никогда не должен зависеть от темы или конкретного проекта.

------------------------------------------------------------------------

<a id="section-3"></a>
# 3. Модель клонирования

Это template/starter repository.

Новый сайт создаётся клонированием:

``` text
astro-blog-core
   ↓
tragarze.pl
   └── src/theme/

astro-blog-core
   ↓
another-project
   └── src/theme/
```

Каждый клон содержит только собственную активную тему:

``` text
src/theme/
```

Не создавать внутри каждого проекта каталог из десятков тем.

Не нужен Bootstrap.

Не нужен автоматический `init-project` wizard, пока это отдельно не
потребуется.

------------------------------------------------------------------------

<a id="section-4"></a>
# 4. Стек

Использовать:

``` text
Astro
TypeScript
MDX
React
CSS
Cloudflare Workers
Cloudflare D1
Cloudflare Turnstile
```

React --- только там, где действительно нужна клиентская
интерактивность.

Не превращать сайт в React SPA.

Не использовать Bootstrap.

Не добавлять тяжёлый UI framework без отдельного решения для конкретного
проекта.

Приоритет:

``` text
Astro
native HTML
modern CSS
минимальные изолированные React islands
Web APIs
```

------------------------------------------------------------------------

<a id="section-5"></a>
# 5. Static-first и минимальный JavaScript

Основной контент должен работать без клиентского JS.

Типичная статья:

``` text
HTML статьи          0 JS
breadcrumbs          0 JS
основная навигация   0/minimal JS
related              0 JS
SEO                   build-time
reading signal        маленький JS
comments              lazy island
search/tools          отдельные optional islands
```

Если задачу можно решить при build-time --- не переносить её на runtime
без причины.

------------------------------------------------------------------------

<a id="section-6"></a>
# 6. Структура репозитория

``` text
/
├── public/
│   ├── favicon/
│   ├── images/
│   ├── fonts/
│   ├── icons/
│   └── static/
│
├── src/
│   ├── core/
│   │   ├── content/
│   │   ├── i18n/
│   │   ├── seo/
│   │   ├── routing/
│   │   ├── api/
│   │   ├── types/
│   │   ├── utils/
│   │   └── validation/
│   │
│   ├── features/
│   │   ├── reads/
│   │   ├── comments/
│   │   ├── search/
│   │   └── shared/
│   │
│   ├── theme/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── islands/
│   │   ├── styles/
│   │   ├── icons/
│   │   └── assets/
│   │
│   ├── content/
│   │   ├── blog/
│   │   ├── authors/
│   │   └── data/
│   │
│   ├── project/
│   │   ├── index.ts
│   │   ├── site.config.ts
│   │   ├── i18n.config.ts
│   │   ├── features.config.ts
│   │   ├── seo.config.ts
│   │   └── navigation.ts
│   │
│   └── pages/
│
├── worker/
│   ├── src/
│   ├── migrations/
│   ├── schema.sql
│   ├── wrangler.jsonc
│   └── package.json
│
├── docs/
├── scripts/
├── astro.config.*
├── tsconfig.json
├── package.json
├── README.md
├── SPEC.md
└── .env.example
```

Codex может улучшить физическую раскладку, но границы CORE / FEATURES /
THEME / PROJECT должны оставаться очевидными.

------------------------------------------------------------------------

<a id="section-7"></a>
# 7. CORE

CORE содержит только переиспользуемые механизмы:

``` text
Content Collections helpers
content normalization
translation relations
slug/route helpers
locale helpers
canonical/hreflang
SEO metadata
structured data
OpenGraph
reading time
sorting/pagination
related-content helpers
generic API primitives
shared types
validation
Intl/date helpers
```

В CORE запрещены:

``` text
tragarze
Katowice
цвета конкретного сайта
проектные категории
польские UI-строки
Vercel/Linear styling
конкретная структура ArticleLayout
```

------------------------------------------------------------------------

<a id="section-8"></a>
# 8. FEATURES

FEATURE --- функциональный модуль, который можно использовать в разных
проектах.

Первоначально:

``` text
reads
comments
search (optional)
```

Feature должен разделять:

1.  логику;
2.  API;
3.  состояние;
4.  визуальное представление.

Не собирать API, translations, state и всю разметку в одном огромном
React-компоненте.

------------------------------------------------------------------------

<a id="section-9"></a>
# 9. THEME

`src/theme/` полностью принадлежит текущему проекту.

Здесь находятся:

``` text
layouts
header/footer
article UI
article previews
cards
buttons
forms
typography
spacing
colors
visual states
mobile behavior
project-specific React views
icons/assets
```

После клонирования тему можно переписать полностью без изменения CORE.

------------------------------------------------------------------------

<a id="section-10"></a>
# 10. Первый проект: tragarze.pl

Для tragarze.pl визуальные референсы --- **Vercel + Linear**, но не
буквальные копии.

От Vercel:

``` text
чистая типографика
иерархия
пространство
тонкие границы
минимум визуального шума
```

От Linear:

``` text
компактная навигация
чёткие состояния
быстрый отклик
плотный, но читаемый интерфейс
сильный mobile UX
```

Итоговая тема должна быть самостоятельной.

Интерфейс tragarze.pl --- польский.

------------------------------------------------------------------------

<a id="section-11"></a>
# 11. PROJECT config

Не создавать один огромный config.

``` text
src/project/
├── index.ts
├── site.config.ts
├── i18n.config.ts
├── features.config.ts
├── seo.config.ts
└── navigation.ts
```

Конфигурация:

``` text
type-safe
простая
документированная
без скрытой магии
```

------------------------------------------------------------------------

<a id="section-12"></a>
# 12. Многоязычность обязательна архитектурно

i18n реализуется сразу, даже если первый сайт использует только
польский.

Одноязычный проект:

``` ts
{
  defaultLocale: "pl",
  locales: ["pl"],
  prefixDefaultLocale: false
}
```

Многоязычный:

``` ts
{
  defaultLocale: "en",
  locales: ["en", "de", "pl"],
  prefixDefaultLocale: false
}
```

Поддержать также:

``` ts
prefixDefaultLocale: true
```

Одноязычный проект не должен принудительно получать `/pl/`.

------------------------------------------------------------------------

## 12.1. Localized Route Segments Map

Route segments, которые являются частью пользовательской информационной
архитектуры, не должны быть глобально hardcoded в CORE.

PROJECT определяет locale-aware route dictionary для включённых route
types, например концептуально:

``` ts
routes = {
  pl: {
    blog: "blog",
    services: "uslugi",
    tools: "narzedzia",
    editorial: "redakcja"
  },
  en: {
    blog: "blog",
    services: "services",
    tools: "tools",
    editorial: "editorial"
  }
}
```

Правила:

-   набор locale берётся из `i18n.config`;
-   route segment должен существовать для locale, если соответствующий
    route type включён;
-   canonical, hreflang, breadcrumbs, author/profile URLs и internal
    routing используют один route map;
-   stable entity IDs и `translationKey` не зависят от локализованных
    route segments;
-   `/redakcja/` является польским PROJECT route, а не глобальной
    CORE-константой.

Пример:

``` text
PL:
/redakcja/marek-nowak/

EN:
/en/editorial/mark-nowak/
```

если именно такие locale routes/person slugs заданы PROJECT.

<a id="section-13"></a>
# 13. Полный i18n

i18n должен охватывать:

``` text
routes
slugs
UI dictionaries
article content
categories
dates
canonical
hreflang
x-default
OpenGraph
structured data
sitemap
RSS
language switcher
navigation
```

Не сводить i18n только к `t("...")`.

------------------------------------------------------------------------

<a id="section-14"></a>
# 14. Идентичность переводов

Переводы одной статьи связывать не по slug, а через стабильный:

``` yaml
translationKey: washing-machine-transport
```

Например:

``` yaml
locale: pl
translationKey: washing-machine-transport
slug: jak-przewiezc-pralke
```

и:

``` yaml
locale: en
translationKey: washing-machine-transport
slug: how-to-move-a-washing-machine
```

Изменение slug не должно ломать связь переводов.

------------------------------------------------------------------------

<a id="section-15"></a>
# 15. Стабильный ID статьи

Каждая статья должна иметь постоянный технический `id`, независимый от
URL и slug.

Пример:

``` yaml
id: "01K..."
```

Использовать его для динамических данных:

``` text
reads
comments
future dynamic features
```

Ключ backend:

``` text
site_id + article_id
```

Не использовать slug как постоянный ID статистики.

------------------------------------------------------------------------

<a id="section-16"></a>
# 16. UI-переводы

Не hardcode:

``` tsx
<button>Dodaj komentarz</button>
```

в reusable feature.

Использовать локализованные строки.

Astro/static strings разрешать build-time.

React island должен получать только нужный ему небольшой словарь
текущего locale, а не весь i18n bundle сайта.

------------------------------------------------------------------------

<a id="section-17"></a>
# 17. Content Collections и MDX

Использовать Astro Content Collections + MDX со строгой схемой.

Рекомендуемый frontmatter статьи:

``` yaml
id:
title:
seoTitle:
description:
slug:
locale:
translationKey:
publishDate:
updatedDate:
updateNote:
authors:
contributors:
category:
tags:
image:
socialImage:
draft:
```

`seoTitle` опционален. Если он отсутствует, для `<title>` и SEO
используется `title`. H1 статьи всегда строится из `title`, чтобы не
ломать человеческий заголовок ради SERP.

Изображение статьи хранить структурировано:

``` yaml
image:
  src:
  alt:
  caption:
  credit:

socialImage:
  src:
  alt:
```

Минимально обязательны `image.src` и `image.alt`. `caption` и `credit`
опциональны. `socialImage` опционален; если отсутствует, OG/social
preview строится из пригодного hero image либо project fallback согласно
разделу 37.

Опционально:

``` yaml
canonical:
noindex:
featured:
related:
toc:
redirectFrom:

`redirectFrom` использует root-relative исторические URL paths и следует контракту раздела 18; locale prefix указывается явно, если он существовал в старом URL.
```

`redirectFrom` --- массив прежних URL статьи после изменения
slug/категории/структуры.

Некорректный контент должен давать понятную build error.

## 17.1. Жизненный цикл публикации

Codex должен однозначно различать состояния статьи.

``` text
draft: true
→ не создаётся публичный production URL
→ нет в sitemap
→ нет в RSS
→ нет в категориях/listing/related/previous-next
→ доступна в dev/preview

publishDate > время production build
→ scheduled
→ ведёт себя как draft в production
→ не появится автоматически по наступлении publishDate
→ для публикации требуется новый production build + deploy после наступления publishDate
→ автоматизация такого rebuild может быть добавлена deploy/project layer, но ISR/runtime publication не является частью v1

published
→ draft != true
→ publishDate <= время build
→ обычная публичная статья

noindex: true
→ URL существует
→ robots = noindex
→ исключается из sitemap
→ может оставаться доступным пользователю
```

Не использовать клиентский JS для скрытия draft/scheduled --- они должны
быть исключены на build-time.

`updatedDate` меняется только при содержательном изменении публикации.
Косметическое форматирование, технический refactor MDX или смена
внутреннего компонента не должны автоматически менять публичную дату
обновления.

`updateNote` является optional editorial metadata и хранится **только в MDX
frontmatter рядом с `updatedDate`**. Это короткая человекочитаемая аннотация,
объясняющая, что содержательно изменилось.

Contract:

``` text
updatedDate отсутствует
→ updateNote MUST отсутствовать

updatedDate существует
→ updateNote optional

updateNote
→ plain text
→ recommended max 180 characters
→ не является changelog
→ не генерируется автоматически из git diff/MDX diff
```

Пример:

``` yaml
updatedDate: 2026-09-15T09:00:00+02:00
updateNote: "Zaktualizowano ceny i dodano nowe zalecenia dotyczące zabezpieczenia AGD."
```

`updateNote` может отображаться на карточке в режиме `Ostatnio
aktualizowane` и внутри статьи рядом с датой обновления.

### 17.1.1. Editorial Source of Truth Contract

MDX frontmatter является единственным source of truth для editorial
metadata статьи.

К editorial metadata относятся минимум:

``` text
id
title / seoTitle
description
slug / locale / translationKey
publishDate / updatedDate / updateNote
authors / contributors
category / tags
image / socialImage
draft / canonical / noindex / featured / related / toc / redirectFrom
```

Generated JSON, listing/discovery manifests, search indexes, RSS, sitemap,
JSON-LD и другие build artifacts являются **производными данными**.

Правило:

``` text
MDX
→ validation/build
→ generated artifacts
```

Запрещено:

``` text
ручное редактирование generated editorial metadata;
считать generated JSON параллельным authoring source;
хранить updateNote/title/category/author/date в D1 как вторую редакционную правду;
двусторонняя синхронизация JSON ↔ MDX.
```

Любой generated editorial artifact должен быть удаляемым и полностью
восстанавливаемым следующим build из MDX + PROJECT content config.

D1/Worker является source of truth только для runtime state/metrics,
которые возникают после публикации: reads, rolling read aggregates,
comments, rating votes и соответствующие aggregates.

## 17.2. Build-time content validation

Production build должен падать при:

``` text
duplicate article id
duplicate route/slug внутри одного locale
некорректной translation relation
несуществующей category
несуществующем author/contributor ID
несуществующем explicit related article
битой внутренней ссылке на локальный content route
битом локальном image path
отсутствующем обязательном image.alt
невалидном canonical URL
невалидном redirectFrom
redirect loop
```

Warnings, но не fatal error:

``` text
orphan article без внутренних входящих ссылок
слишком длинный SEO title
слишком длинный description
отсутствующий optional hero image
```

Пороговые значения title/description являются диагностическими, а не
жёсткими SEO-правилами.

## 17.3. MDX-контракт

Стандартный контент должен корректно поддерживать:

``` text
H2/H3/H4
ordered/unordered lists
blockquote
table
figure/figcaption
images
inline code
code blocks
internal/external links
callout
```

Требования:

``` text
heading IDs генерируются предсказуемо
anchor links не ломают layout
scroll-margin учитывает sticky header
tables не создают overflow страницы — использовать локальный horizontal scroll wrapper
code blocks имеют локальный overflow
реально прокручиваемый table/code wrapper доступен с клавиатуры; не добавлять лишние tab stops контейнерам без overflow
если scroll wrapper получает отдельную focusable region semantics, он имеет понятный accessible name; таблица сохраняет корректные table/caption/header semantics
scroll hint/edge fade допустим как визуальная подсказка только при реальном overflow и не является единственным способом сообщить о прокрутке
images responsive
external links не требуют JS
```

Не разрешать произвольный проектный React-код внутри каждой статьи как
нормальный способ публикации. Интерактивные embeds/components должны
быть явно зарегистрированными MDX-компонентами.

## 17.4. Registry MDX-компонентов

THEME может содержать контролируемый registry:

``` text
src/theme/components/mdx/
├ Figure.astro
├ Callout.astro
├ TableWrapper.astro
└ ...
```

MDX использует только зарегистрированные компоненты с предсказуемым API.
CORE не должен знать их визуальный дизайн.

## 17.5. Редакция, авторы и участники публикации

Редакционная модель является частью контентной архитектуры и должна
поддерживать авторов, редакторов, проверяющих и совместное авторство без
дублирования данных. Люди хранятся как отдельные стабильные сущности, а
статьи ссылаются на их `id`. Не хранить имя человека как единственный
источник истины во frontmatter статьи.

### 17.5.1. Единая сущность Person

Все авторы, редакторы и другие участники публикаций используют одну
коллекцию `authors`/`people` (конкретное имя директории выбрать один раз
и использовать последовательно). Рекомендуемая модель:

``` yaml
id: marek-nowak
name: Marek Nowak
slug: marek-nowak
locale: pl
role: editor_in_chief
rank: 100
headline: Redaktor naczelny tragarze.pl
bioShort:
bio:
expertise:
  - przeprowadzki
  - organizacja-transportu
image:
  src:
  alt:
links: []
```

`id` стабилен и не зависит от slug или должности. `rank` используется
только для сортировки команды и не кодирует права доступа. Смена
должности не должна требовать переписывания старых статей.

Контролируемый набор основных ролей v1:

``` text
editor_in_chief
senior_editor
editor
author
contributor
```

Project может локализовать отображаемые названия ролей через i18n, но
внутренние значения остаются стабильными. Не использовать произвольные
варианты вроде `redaktor`, `edited-by`, `reviewer2`.

### 17.5.2. Авторство и редакционное участие статьи

Во frontmatter разделять настоящих авторов и остальных участников:

``` yaml
authors:
  - jan-kowalski

contributors:
  - person: marek-nowak
    role: editor
  - person: piotr-wisniewski
    role: reviewedBy
```

Если статья действительно написана совместно:

``` yaml
authors:
  - jan-kowalski
  - anna-nowak
```

`authors[]` --- люди, которые публично являются авторами статьи.
`contributors[]` --- люди, участвовавшие в подготовке, но не являющиеся
авторами.

Контролируемые роли участия v1:

``` text
editor
reviewedBy
factCheckedBy
research
```

Не превращать каждого contributor в `Article.author`. В structured data
перечислять всех и только реальных `authors[]`; редакционное участие
отображать отдельно.

### 17.5.3. Публичная редакция

Создать индексируемую страницу:

``` text
/redakcja/
```

Для локализованных проектов маршрут должен проходить через общий
i18n/routing слой, а не быть hardcoded в CORE.

Страница редакции --- не список аватаров, а полноценная trust/content
page. Она должна содержать:

``` text
H1 и краткое описание редакции
как создаются материалы
как проходит редактура и проверка
как обновляются публикации
главный редактор
редакторы
авторы
другие участники, если они публичны
ссылки на персональные профили
```

Команду группировать по роли и сортировать внутри группы по `rank`,
затем по имени. Пустые группы не выводить. Не создавать отдельные URL
для должностей без самостоятельной контентной ценности.

Страница `/redakcja/` должна иметь собственные `title`, `description`,
canonical, breadcrumbs и подходящую structured data разметку. Она
включается в sitemap, если не отключена project config.

### 17.5.4. Персональная страница

Канонический маршрут профиля:

``` text
/redakcja/{person-slug}/
```

Не использовать `/blog/autor/`, потому что человек может быть
редактором, reviewer или главным редактором, а не только автором.

Персональная страница должна быть содержательным hub, а не тонкой
bio-страницей. Рекомендуемая структура:

``` text
breadcrumbs
имя
текущая публичная роль
аватар
headline / краткая специализация
bio
темы/expertise

Publikacje autora
→ статьи, где person.id присутствует в authors[]

Redakcja i weryfikacja
→ статьи, где person.id присутствует в contributors[]
```

Если человек не имеет публикаций в одной из групп, соответствующий блок
не выводить. Списки статей вычисляются build-time из коллекции статей;
не хранить `articles:` внутри профиля человека. Это обеспечивает один
источник истины.

Для большого количества публикаций использовать ту же статическую
pagination infrastructure, что и для blog/category listings. Не
загружать список публикаций через client-side API.

Профиль должен иметь собственные `title`, `description`, canonical,
breadcrumbs и `ProfilePage` + `Person` structured data. URL профиля
должен использоваться как URL автора в structured data статьи.

### 17.5.5. Отображение участия внутри статьи

Не превращать metadata статьи в длинный список должностей. Основной
интерфейс показывает автора/авторов компактно. Дополнительные роли могут
находиться в metadata/info disclosure статьи.

Пример польского UI:

``` text
Jan Kowalski
Autor

Opracowanie redakcyjne: Marek Nowak
Sprawdzono przez: Piotr Wiśniewski
```

При нескольких настоящих авторах показывать всех. Каждое имя, для
которого существует публичный профиль, ссылается на `/redakcja/{slug}/`.

### 17.5.6. Иерархия и связи

Иерархия редакции существует на уровне `Person.role + rank`, а не в URL
и не в статье. Не создавать вложенные URL вида
`/redakcja/redaktorzy/...`.

Связи вроде «редактировал публикации», «проверял публикации»,
«сотрудничал с авторами» должны выводиться из фактических
`authors[]`/`contributors[]` связей build-time. Не поддерживать вручную
дублируемые списки связей между людьми.

### 17.5.7. Виртуальные редакционные персоны

Архитектура допускает виртуальные редакционные персоны, но данные должны
оставаться последовательными: стабильное имя, роль, специализация и
история публикаций. Не генерировать десятки бессодержательных профилей
ради количества страниц.

Не выдумывать проверяемые биографические утверждения (дипломы, реальные
работодатели, награды, профессиональные лицензии, внешние профили), если
проект не предоставляет такие данные. Описание должно фокусироваться на
роли человека в редакции и тематике его материалов.

### 17.5.8. SEO и индексация редакционных страниц

По умолчанию `/redakcja/` и содержательные персональные страницы
indexable и self-canonical. Они входят в sitemap и внутреннюю
перелинковку.

Не создавать индексируемый профиль, если у сущности нет достаточного
публичного содержания. Project может поставить `noindex` для
технической/временной персоны.

Статья должна связываться с профилем автора как минимум через:

``` text
видимую HTML-ссылку на профиль
Article structured data author.url
Person/ProfilePage на профиле
```

Редакционная страница должна ссылаться на профили, а профили --- на
реальные публикации. Таким образом формируется статический граф
`article ↔ person ↔ editorial role ↔ publications`, без отдельной базы
данных.

### 17.5.9. Валидация

Build должен падать при:

``` text
несуществующем ID из authors[]
несуществующем contributors[].person
неподдерживаемой contributors[].role
duplicate person id
duplicate person slug внутри locale
пустом authors[] для обычной индексируемой статьи, если project config не разрешает institutional author
```

Один человек может одновременно быть `author` одной статьи и `editor`
другой. Текущая должность Person не ограничивает допустимое историческое
участие в конкретной статье.

### 17.5.10. Pagination авторского профиля

Если authored/edited/reviewed listing профиля требует pagination,
используется единая статическая URL-схема:

``` text
/{localized-editorial-segment}/{person-slug}/
/{localized-editorial-segment}/{person-slug}/page/{page}/
```

Для польского PROJECT route:

``` text
/redakcja/jan-kowalski/
/redakcja/jan-kowalski/page/2/
```

Правила:

``` text
/page/1/
→ canonical/base profile URL
→ не является отдельной indexable page

page >= 2
→ собственный static route
→ self-canonical

invalid/non-integer/out-of-range page
→ real 404
```

`localized-editorial-segment` берётся из PROJECT route map, а не
hardcoded из `redakcja`.

Сортировка/фильтрация на профиле следует общему sorting/canonical
contract раздела 74 и не меняет базовую pagination URL scheme.

Для authored publications v1 пользовательский allowlist:

``` text
newest
popular
comments
updated
```

`popular` на странице автора означает all-time `article_stats.reads`, а
не `Popularne teraz`: профиль автора отвечает на вопрос о наиболее
читаемых работах автора в целом. `updated` использует только реальный
MDX `updatedDate`; `publishDate` не подставляется вместо отсутствующей
даты обновления.

## 17.6. Категории и теги

Категория --- отдельная стабильная content/data сущность, а статья
ссылается на её ID. Не хранить название категории как единственный
источник истины внутри каждой статьи.

Минимальная модель категории:

``` yaml
id:
slug:
locale:
translationKey:
name:
description:
image:
noindex:
```

Правила:

``` text
category ID обязан существовать
slug уникален в рамках locale/category route space
category page генерируется статически
пустая category page по умолчанию не генерируется
draft/scheduled articles не учитываются при определении наличия контента категории
category translation связывается через translationKey, а не slug
```

Теги в v1 могут оставаться лёгкими строковыми taxonomy values, если
проекту не нужны отдельные индексируемые tag pages. Не создавать
SEO-страницы каждого тега автоматически. Если tag pages позже
включаются, для них должна появиться отдельная schema/config и явная
index/noindex политика.

------------------------------------------------------------------------

<a id="section-18"></a>
# 18. Routing

Starter не предполагает, что `/` всегда является главной блога.

Базовый блог может использовать:

``` text
/blog/
/blog/{category}/
/blog/{category}/{slug}/
/blog/page/{page}/
/blog/{category}/page/{page}/
```

`/page/1/` не генерировать: первая страница имеет canonical URL самой
основной listing/category страницы.

По умолчанию listing сортируется:

``` text
publishDate DESC
```

Draft, scheduled и непубличный контент в listing не попадают. Размер
страницы задаётся PROJECT config, а не hardcode в CORE.

Для tragarze.pl блог отделён от:

``` text
/uslugi/
/narzedzia/
```

CORE не должен знать об этих коммерческих URL.

### 18.1.1. Канонический формат `redirectFrom`

`redirectFrom` всегда хранит root-relative исторические URL paths от
корня сайта (`/...`).

Каждое значение `redirectFrom` является реальным историческим URL path
от корня сайта:

``` text
/...
```

Требования:

-   обязательный ведущий `/`;
-   без origin/domain;
-   path уже содержит locale prefix, если он существовал в реальном
    старом URL;
-   generator не должен автоматически добавлять locale prefix к
    `redirectFrom`;
-   generator нормализует допустимые trailing-slash правила и проверяет
    duplicates/loops/chains;
-   destination всегда вычисляется из текущего canonical route сущности.

Примеры при:

``` text
prefixDefaultLocale: false
```

PL:

``` yaml
redirectFrom:
  - /blog/stary-slug/
```

EN:

``` yaml
redirectFrom:
  - /en/blog/old-slug/
```

Если:

``` text
prefixDefaultLocale: true
```

PL historical path может быть:

``` yaml
redirectFrom:
  - /pl/blog/stary-slug/
```

`redirectFrom` описывает фактически существовавший старый URL, а не
относительный slug внутри locale.


## 18.1. Redirects при изменении URL

Стабильный `article_id` сохраняет backend-данные, но не заменяет HTTP
redirect старого URL.

При изменении slug/category/route прежний адрес должен быть добавлен в
`redirectFrom` или эквивалентный project redirect registry.

``` text
old URL → настоящий HTTP 301 → current canonical URL
```

### 18.1.2. Static hosting и deploy adapter

В чистом Astro SSG без server/static adapter нельзя считать
HTML/meta-refresh эквивалентом HTTP 301. Redirect должен выполняться
уровнем hosting/edge до отдачи HTML.

CORE собирает единый нормализованный redirect manifest из `redirectFrom`
и project redirect registry. PROJECT/deploy target определяет способ
экспорта этого manifest.

Минимально предусмотреть:

``` text
cloudflare-pages → generate public/_redirects
other static/shared hosting → export neutral redirects manifest + documented host-specific installation
```

Пример deploy adapter для Cloudflare Pages:

``` text
/old/path/ /new/path/ 301
```

Не hardcode Cloudflare Pages как единственный hosting starter: Astro
может оставаться на обычном static/shared hosting, а Worker/D1 ---
отдельно в Cloudflare. Для другого production hosting README обязан
описать, как redirect manifest превращается в реальные server/edge
redirects (`.htaccess`, provider rules, nginx config и т.п. --- только
если конкретный target это поддерживает).

Если выбран deploy target, который не умеет применить server-side
redirect rules автоматически, production workflow обязан явно
сигнализировать, что redirects требуют установки на hosting; нельзя
молча заменять их meta refresh.

Production validation должна обнаруживать duplicate redirect source,
redirect loop, redirect chain и redirect на самого себя. При смене URL
несколько раз старые sources по возможности должны указывать сразу на
текущий canonical URL, а не образовывать цепочку.

Definition of Done для redirects проверяется HTTP-запросом (`curl -I`
или эквивалент): старый URL должен вернуть `301` и корректный
`Location`.

## 18.2. Удаление и объединение публикаций

Удаление опубликованной статьи не должно происходить без явного решения:

``` text
301 → если есть прямой релевантный replacement
410 → если материал сознательно удалён без замены
404 → допустимо только как осознанное решение
```

Не создавать автоматически бессмысленный redirect всех удалённых статей
на `/blog/` или homepage.

`410 Gone` также требует поддержки на уровне hosting/edge; статический
HTML сам по себе не может гарантировать этот HTTP status. Если PROJECT
использует 410, redirect/status manifest должен уметь описать tombstone
route и deploy documentation должна объяснять его применение. Если
выбранный static hosting не поддерживает 410 без дополнительной
edge/server конфигурации, настоящий 404 является допустимым явно
задокументированным fallback; soft-404/200 запрещён.

## 18.3. 404 и неизвестные маршруты

THEME должен иметь полноценную project-owned 404 page.

404:

``` text
возвращает настоящий HTTP 404 там, где hosting/platform это поддерживает
не содержит canonical на случайно запрошенный URL
не индексируется
содержит понятный путь назад: homepage/blog/search/category navigation по решению THEME
не зависит от Worker/JS
```

Не превращать 404 в soft-404 через автоматический redirect на главную.

------------------------------------------------------------------------

<a id="section-19"></a>
# 19. Layout принадлежит THEME

CORE предоставляет данные, THEME решает их расположение.

CORE может предоставить:

``` text
title
author
dates
readingTime
translations
related
category
breadcrumbs data
SEO data
```

THEME решает, где и как это показать.

------------------------------------------------------------------------

<a id="section-20"></a>
# 20. Превью статьи: progressive metadata disclosure

Не перегружать карточку статьи метаданными.

На превью постоянно показывать только минимальный набор, необходимый для
выбора материала.

Для tragarze.pl первоначальный ориентир:

``` text
дата · время чтения          [ⓘ] [share]
```

Допустимо позже добавить публичное число прочтений рядом, если это
улучшит UX, но по умолчанию не перегружать карточку.

`ⓘ` открывает небольшое информационное окно, привязанное к кнопке на
desktop; на маленьком mobile допустим компактный bottom sheet.

Расширенная информация:

``` text
дата публикации
дата изменения
время чтения
прочтения
комментарии
```

Share --- отдельная кнопка, не внутри `ⓘ`.

## 20.1. Поведение `ⓘ` desktop/mobile

Контрол `ⓘ` и его trigger должны присутствовать в первоначальном HTML и
не появляться только после hydration; это исключает layout shift самого
trigger.

Рекомендуемое progressive-enhancement поведение:

``` text
desktop → компактный native Popover API / немодальное раскрытие около trigger
mobile (<640px) → компактный `<dialog>`/modal presentation, визуально оформленный THEME как bottom sheet
```

Не называть `<dialog>` «нативным bottom sheet»: bottom-sheet --- это
визуальная форма представления. Обязательны явная кнопка закрытия,
корректный focus management и закрытие стандартным platform/Escape
behavior там, где это поддерживается. Swipe-to-dismiss опционален и не
должен добавляться ценой тяжёлого JS. React для этого контрола не
требуется.

------------------------------------------------------------------------

<a id="section-21"></a>
# 21. Share

Share является отдельным действием рядом с информацией.

На поддерживаемых устройствах в первую очередь использовать:

``` js
navigator.share()
```

чтобы пользователь получил системное меню установленных приложений.

Fallback:

``` text
copy link
небольшой набор проектно выбранных share links
```

Не загружать тяжёлую social-sharing библиотеку.

------------------------------------------------------------------------

<a id="section-22"></a>
# 22. SEO и скрытые метаданные

Визуально скрытые за `ⓘ` данные не должны исчезать из семантического
HTML/SEO там, где они SEO-релевантны.

Дата публикации и изменения должны присутствовать в корректной
разметке/structured data независимо от того, раскрыта ли информация
пользователем.

Не загружать статические метаданные через API после клика.

------------------------------------------------------------------------

<a id="section-23"></a>
# 23. Чтения: максимально простой backend

Первая версия **не считает и не показывает сложную аналитику
возвратов**.

Не нужны публичные:

``` text
total views
unique views
returning readers
return percentage
```

Основная публичная метрика одна:

``` text
прочтения
```

Для польского интерфейса предпочтительное человеко-понятное название:

``` text
Czytelnicy
```

или другой естественный польский вариант, выбранный при финальном
UI-копирайтинге.

Главная цель --- одна понятная цифра, а не аналитическая панель.

------------------------------------------------------------------------

<a id="section-24"></a>
# 24. Когда засчитывается прочтение

Открытие страницы само по себе **не является прочтением**.

Прочтение засчитывается, когда пользователь выполнил хотя бы одно
условие:

``` text
провёл на странице не менее 10 секунд
ИЛИ
достиг не менее 25% статьи
```

После первого выполнения любого условия клиент отправляет одно событие:

``` text
POST /v1/read
```

или эквивалентный versioned endpoint.

Событие отправляется только один раз за текущую загрузку страницы.

Не отправлять heartbeat, scroll telemetry или периодические события.

------------------------------------------------------------------------

<a id="section-25"></a>
# 25. Минимизация идентификации и логики reads

Цель первой версии --- максимально простой и дешёвый backend.

Не строить систему returning readers.

Не хранить историю всех открытий.

Не создавать сложную таблицу поведения пользователя ради публичной
статистики.

Нужно только разумно защищаться от очевидного повторного накручивания
одной и той же статьёй одним браузером.

Anonymous `visitor_id` используется server-side для уже нужных runtime
features/rate limiting; read dedup v1 не требует persistent visitor read
history. Конкретный механизм определён разделом 27.

Не хранить raw IP как пользовательский идентификатор.

Не использовать browser fingerprinting.

------------------------------------------------------------------------

<a id="section-26"></a>
# 26. Что хранит backend для reads

Основная агрегированная таблица должна быть минимальной.

Концептуально:

``` sql
article_stats

Физическая схема `article_stats` определяется разделом 85; более ранние feature-разделы описывают только семантику агрегатов и state transitions.


site_id
article_id
reads
comments_count
updated_at_ms
```

`comments_count` поддерживается комментариями согласно разделу 32.13.
Рейтинг статьи является утверждённой функцией v1.
Authoritative rating contract находится в разделе 75, а physical D1
storage --- в разделе 85. Раздел 26 не определяет альтернативную модель.

Для самого счётчика чтений обязательны только:

``` text
site_id
article_id
reads
updated_at_ms
```

Не добавлять `returning_readers`, если функциональность не используется.

------------------------------------------------------------------------

<a id="section-27"></a>
# 27. Deduplication чтений

Нужно избежать очевидного:

``` text
refresh
refresh
refresh
→ +3 reads
```

но не строить историю поведения пользователя.

Authoritative v1 model:

``` text
qualified-read detector
+
browser-local per-article timestamp
+
Worker resource-specific abuse rate limit
```

Frontend после достижения `10 sec OR 25%` проверяет локальный marker:

``` text
read:{site_id}:{article_id}
→ last accepted qualified-read timestamp
```

Если timestamp находится внутри configured dedup window:

``` text
POST /v1/read не отправляется
```

После успешного accepted POST marker обновляется.

Marker:

``` text
не является identity
не содержит article content
не синхронизируется между устройствами
может храниться в localStorage
```

Окно задаётся config/backend constant и должно быть одинаково понятно
frontend и Worker policy.

Worker дополнительно применяет route/resource-specific rate limiting,
чтобы простое ручное повторение POST не превращалось в неограниченный
счётчик. `visitor_id + article_id` может использоваться как transient
rate-limit key согласно разделу 47.1, но Worker не создаёт D1-таблицу
истории чтений по visitor.

Если пользователь очистил local storage/cookie, использует другой browser
или намеренно обходит frontend, повторный read иногда может быть
засчитан. Это сознательный privacy/complexity compromise v1.

Запрещено ради reads добавлять:

``` text
raw IP identity
fingerprinting
persistent cross-article read history
returning-reader profile
event table всех просмотров
```

`article_stats.reads` остаётся единственным persistent D1 read aggregate.


<a id="section-28"></a>
# 28. Публичная статистика reads

Публичные цифры не обязаны быть realtime.

Использовать eventual consistency.

Допустимый первоначальный подход:

``` text
D1 = source of truth
↓
Worker формирует компактный public stats snapshot
↓
snapshot/cache обновляется примерно раз в час
↓
клиенты получают дешёвый JSON
```

Один snapshot может содержать статистику сразу для множества статей.

Не делать:

``` text
12 карточек → 12 запросов
```

------------------------------------------------------------------------

<a id="section-29"></a>
# 29. Static и dynamic metadata

Статические данные идут из MDX/Astro:

``` text
publishDate
updatedDate
readingTime
```

Динамические:

``` text
reads
comments
article rating  # обязательная функция, authoritative rating contract определён в разделе 75
```

`Pomocne` относится только к комментариям и не является article rating.

Рейтинг статьи является утверждённой обязательной функцией v1.
Единственный authoritative contract для шкалы, UI, API, anonymous vote
identity, storage, aggregates, Bayesian `ratingScore`, sorting и
schema.org integration находится в разделе 75. Раздел 29 не определяет
альтернативную rating model.

Динамические значения рейтинга, reads и comments используют
согласованный компактный stats snapshot согласно разделам 26, 75 и
канонической D1 model раздела 85.

Не отправлять даты и reading time через Worker без причины.

Progressive enhancement rule для desktop metadata disclosure:

``` text
Popover API supported
→ использовать native popover

Popover API unavailable
→ доступный lightweight fallback
```

Fallback может использовать небольшой JS state/class toggle или
`<details>`/другую нативную семантику, если она соответствует THEME.

Нельзя делать metadata `ⓘ` полностью недоступной только из-за отсутствия
Popover API.


<a id="section-32"></a>
# 32. Comments

## 32.1. Форма комментария

Минимальные поля:

``` text
Imię
Komentarz
Turnstile
Wyślij
```

Жёсткие ограничения UI:

``` html
<input maxlength="40">
<textarea maxlength="1500"></textarea>
```

Для textarea показывать счётчик, например:

``` text
328 / 1500
```

Frontend не должен позволять обычному пользователю ввести больше лимита.
Backend всё равно повторно валидирует ограничения и не доверяет клиенту.

Пользовательский HTML запрещён. Текст комментария хранится как plain
text. URL могут распознаваться и превращаться в безопасные `<a>` только
при рендеринге.

## 32.2. Серверная валидация и антиспам

`POST /v1/comments` выполняет проверки в таком порядке:

``` text
1. method/content-type/body
2. разрешённый Origin для site_id
3. существование site_id + article_id
4. Turnstile server-side verification
5. name/body limits
6. parent_id, если это reply
7. duplicate protection
8. link detection
9. очевидные spam-patterns
10. определение статуса
```

Невалидные запросы не сохраняются вообще:

``` text
name > 40             → reject 400/422
body > 1500           → reject 400/422
empty body            → reject
invalid article_id    → reject
invalid site_id       → reject
invalid Origin        → reject
invalid parent_id     → reject
Turnstile failed      → reject
duplicate recent body → reject
```

Важно: превышение 1500 символов не является причиной `pending`. Это
обход клиентского контракта, поэтому запрос сразу выбрасывается и не
занимает D1.

Антиспам v1 намеренно простой:

``` text
0 ссылок + нормальный текст → published
ровно 1 URL                 → pending; после ручной проверки может быть published
2+ URL                      → pending; в v1 не может быть published, только spam/delete
очевидный spam-pattern      → spam
```

Даже **одна ссылка всегда отправляет комментарий на ручную модерацию**. Published invariant и правила `link_rel` определены разделом 32.5.

Не вводить сложный SpamScore. При необходимости список очевидных
spam-patterns должен быть коротким, прозрачным и редактируемым в
коде/config.

## 32.3. Turnstile

Turnstile используется для публичной отправки комментария.

Frontend передаёт token вместе с POST. Worker обязан проверять token
server-side до записи в D1.

Не считать клиентскую успешную проверку достаточной.

Если Turnstile не прошёл --- комментарий не создаётся ни в `pending`, ни
в `spam`.

## 32.4. Таблица comments

Feature-level model:

``` text
published
pending
spam
```

`deleted` как статус не нужен. Команда удаления физически удаляет
запись.

`moderation_reason` используется только для объяснимых исключений,
например:

``` text
link
spam_pattern
```

`link_rel` применяется только по published invariant раздела 32.5.

Физическая таблица, CHECK constraints и **единственный authoritative
набор индексов** определены разделом 85. Feature section не определяет
второй вариант D1 schema/indexes.

Комментарий с несколькими URL остаётся `pending` и в v1 не может быть
переведён в `published`; admin body editor отсутствует согласно разделам
32.5/32.15.

## 32.5. Ссылки и ручное управление rel

Любой комментарий с URL:

``` text
submit
→ pending
→ ручная проверка
→ publish либо spam/delete
```

Published v1 invariant:

``` text
0 URL
→ link_rel MUST be null

exactly 1 valid http/https URL
→ может быть published
→ admin выбирает link_rel

2+ URL
→ не может быть published в v1
→ admin выбирает spam/delete
→ текст комментария в admin v1 не редактируется
```

Это устраняет неоднозначность между plain-text `body` и отдельным
`link_rel`: если published comment содержит ссылку, в body существует
ровно один валидированный URL, и `link_rel` относится именно к нему.

Администратор для единственной разрешённой ссылки выбирает:

``` text
dofollow
nofollow
sponsored
```

API и renderer не переопределяют выбранный `link_rel`.

Logical `dofollow` означает отсутствие SEO-restrictive `nofollow` /
`sponsored` token; renderer не обязан и не должен генерировать
нестандартное `rel="dofollow"`.

Mapping:

``` text
dofollow
→ no nofollow/sponsored rel token

nofollow
→ rel includes nofollow

sponsored
→ rel includes sponsored
```

Если THEME когда-либо открывает external link через `target="_blank"`,
добавляется безопасный `noopener` независимо от SEO-rel. По умолчанию
starter не обязан открывать user links в новой вкладке.

Пользователь не может присылать собственный `<a>`, `rel`, HTML или
атрибуты. Backend хранит plain-text body и отдельно `link_rel`; renderer
распознаёт только валидированный `http/https` URL и создаёт безопасный
`<a>` сам.

Система может публиковать заранее подготовленный/коммерческий комментарий
с одной ссылкой и назначить ему `dofollow`, если это требуется PROJECT.

Admin text editor в v1 не добавляется. Если позже потребуется правка
текста модератором, это отдельное изменение contract с повторной runtime
validation и audit implications.

## 32.6. Pomocne

У комментария одна положительная реакция:

``` text
Pomocne 12
```

Не использовать:

``` text
dislike
stars
emoji reactions
karma
user reputation
```

Публичный endpoint:

``` text
POST /v1/comments/{id}/helpful
```

Обычный пользователь увеличивает `helpful_count` через этот endpoint.
Для защиты от банального многократного клика использовать простой
anonymous `visitor_id`/локальный deduplication. Не строить сложную
антифрод-систему.

Критически важно: **администратор может вручную изменить `helpful_count`
на любое неотрицательное значение**.

Например:

``` text
Pomocne: [ 34 ]
[Zapisz]
```

Это нужно в том числе для ручного управления тем, какие комментарии
естественно попадают в TOP-5. Не вводить отдельный `featured_override`,
если задачу можно решить обычным `helpful_count`.

Алгоритм отбора остаётся единым для обычных и вручную скорректированных
комментариев:

``` sql
WHERE site_id = ?
  AND article_id = ?
  AND status = 'published'
ORDER BY helpful_count DESC, created_at_ms DESC
LIMIT 5;
```

Таким образом выбранный администратором комментарий не получает
отдельной искусственной позиции: он входит в TOP-5 тем же способом, что
и остальные.

## 32.7. Featured comments в статическом HTML

До 5 лучших опубликованных комментариев должны попадать непосредственно
в статический HTML статьи при Astro build.

Схема:

``` text
D1
↓
выбор TOP 5 по helpful_count
↓
featured-comments.json / build-time data
↓
Astro build
↓
HTML статьи
```

Допустим единый build-time snapshot:

``` json
{
  "01KARTICLE1": [
    {
      "id": "01KCOMMENT...",
      "name": "Jan",
      "body": "...",
      "createdAt": "...",
      "helpfulCount": 34,
      "linkRel": "dofollow"
    }
  ]
}
```

Ограничение: максимум 5 записей на статью. Snapshot не превращать в
полную копию базы комментариев.

Если featured-комментарий содержит разрешённую ссылку, Astro renderer
обязан сохранить выбранный администратором `link_rel` и безопасно
сформировать `<a>`.

Обновление D1 само по себе не меняет уже развёрнутый HTML. Новый TOP-5
попадает в HTML после следующего build/deploy.

## 32.8. Первая страница и пагинация --- обязательное поведение

Featured-комментарии являются частью **только первой страницы
комментариев**.

Страница 1:

``` text
Komentarze (127)

Wyróżnione
[до 5 featured из статического HTML]

Najnowsze
[первая динамическая порция]

[Далее / Pokaż więcej]
```

Страница 2 и все последующие:

``` text
Komentarze (127)

[только следующая динамическая порция]

[Назад] [Далее]
```

Обязательное правило:

``` text
page/cursor 1 → featured HTML + dynamic newest
page/cursor 2+ → только dynamic comments
```

**Никогда не повторять отдельный блок featured на второй и последующих
страницах.**

Featured TOP-5 являются отдельной первой секцией и **не должны
повторяться ни в `Najnowsze` первой страницы, ни на page/cursor 2+**.
Это соответствует пользовательской модели: выбранные TOP-5 существуют
только в верхнем HTML-блоке первой страницы комментариев.

Astro передаёт CommentsIsland максимум 5 `featuredIds` из того же
build-time snapshot. Каждый запрос динамической пагинации использует
этот неизменный набор как исключение. API может принимать компактный
параметр `excludeIds` (максимум 5 ID) либо эквивалентный безопасный
контракт. Backend валидирует ID и использует prepared parameters;
пользовательский SQL запрещён.

Динамическая хронология использует **keyset/cursor pagination**, а не
OFFSET:

``` sql
ORDER BY created_at_ms DESC, id DESC
```

Cursor должен быть opaque и однозначно кодировать последний
`(created_at_ms, id)` предыдущей порции. Следующий запрос выбирает
только элементы строго после этого anchor в порядке сортировки и также
исключает те же `featuredIds`. Это предотвращает сдвиги/дубли при
появлении новых комментариев между запросами.

Концептуально:

``` text
page/cursor 1 → static featured TOP-5 + 20 newest non-featured
page/cursor 2+ → следующие 20 non-featured по стабильному cursor
featuredIds → исключены из всей dynamic pagination session
```

Размер динамической порции v1:

``` text
20 comments
```

Нумерованные URL страниц комментариев не обязательны, если UX реализован
через `Pokaż więcej`/next cursor. OFFSET pagination для live comments не
использовать.

### Глобальное SQL-исключение `featuredIds`

`featuredIds` исключаются в SQL до `ORDER BY` / `LIMIT` на каждом
динамическом запросе pagination session. Нельзя получить страницу из БД,
а затем удалить featured rows только на frontend.

Концептуальный query:

``` sql
SELECT ...
FROM comments
WHERE
  site_id = ?
  AND article_id = ?
  AND status = 'published'
  AND id NOT IN (?, ?, ?, ?, ?)
  AND (
    created_at_ms < ?
    OR (
      created_at_ms = ?
      AND id < ?
    )
  )
ORDER BY created_at_ms DESC, id DESC
LIMIT ?;
```

Фактическое число placeholders для `NOT IN` соответствует числу
`featuredIds` от 0 до 5; пустой набор не должен генерировать
некорректный `NOT IN ()`.

Backend:

-   валидирует максимум 5 IDs;
-   использует prepared parameters;
-   применяет тот же неизменный набор exclusions ко всем cursor pages
    этой пользовательской pagination session;
-   применяет exclusion до `LIMIT`.

Keyset pagination не является immutable snapshot всей дискуссии. Новые
published comments и moderation changes во время чтения могут изменить
доступный result set, но новые строки выше текущей cursor boundary не
создают OFFSET-style сдвиг.

Если comment, соответствующий cursor boundary, позже перестал быть
`published`, cursor всё равно остаётся валидной границей по
`(created_at_ms, id)`; backend не обязан повторно находить сам cursor
row.

### 32.8.1. Канонический query contract

`featuredIds` (0--5 IDs) исключаются на backend в SQL **до** `ORDER BY`
и `LIMIT` на каждом динамическом запросе pagination session.

Концептуально:

``` sql
SELECT ...
FROM comments
WHERE
  site_id = ?
  AND article_id = ?
  AND status = 'published'
  /* при наличии featuredIds: */
  AND id NOT IN (?, ...)
  AND (
    created_at_ms < ?
    OR (created_at_ms = ? AND id < ?)
  )
ORDER BY created_at_ms DESC, id DESC
LIMIT ?;
```

Если `featuredIds` пуст, условие `NOT IN` не генерируется. Backend
валидирует максимум 5 IDs и использует prepared parameters.

Один и тот же набор `featuredIds`, полученный из server/build snapshot
первой страницы, исключается во всей cursor-pagination session. Нельзя
сначала получить `LIMIT 20`, а затем удалить featured rows только на
frontend.

Keyset pagination не является immutable snapshot дискуссии. Новые
published comments и moderation changes во время чтения могут изменить
доступный result set, но не создают OFFSET-style сдвиг. Cursor остаётся
opaque boundary по `(created_at_ms, id)` и не требует, чтобы
boundary-row всё ещё был `published`.

## 32.9. Replies

Поддерживать ответы через `parent_id`.

Визуально --- максимум один уровень:

``` text
root comment
├ reply
├ reply
└ reply
```

Если пользователь отвечает на reply, backend/frontend нормализует parent
к корневому комментарию.

Reply проходит те же правила:

``` text
Turnstile
validation
link moderation
spam rules
```

Отдельный endpoint для reply не нужен; используется тот же
`POST /v1/comments` с `parentId`.

## 32.10. Жалобы

Каждый опубликованный комментарий может иметь действие:

``` text
Zgłoś
```

Endpoint:

``` text
POST /v1/comments/{id}/report
```

Действие:

``` text
reports_count += 1
```

Жалоба **не скрывает комментарий автоматически**. Это защищает от
простого abuse через массовые жалобы.

Комментарий с `reports_count > 0` появляется в очереди `Do sprawdzenia`.

После решения модератора `Zostaw`:

``` text
reports_count = 0
```

## 32.11. Public Comments API

Минимальный API:

``` text
GET  /v1/comments?articleId=...&limit=20&cursor=...&excludeIds=...
POST /v1/comments
POST /v1/comments/{id}/helpful
POST /v1/comments/{id}/report
```

`GET` возвращает только `published`.

Минимальная публичная модель:

``` json
{
  "items": [
    {
      "id": "01KCOMMENT...",
      "parentId": null,
      "name": "Jan",
      "body": "...",
      "createdAt": "...",
      "helpfulCount": 12,
      "linkRel": null
    }
  ],
  "nextCursor": "..."
}
```

Не отдавать публично:

``` text
status
moderation_reason
reports_count
internal moderation metadata
```

После `POST /v1/comments`:

-   если комментарий сразу `published`, вернуть готовую публичную
    модель, чтобы island вставил её без дополнительного GET;
-   если `pending`, вернуть статус pending и показать польское сообщение
    вроде `Komentarz został wysłany do sprawdzenia.`;
-   если reject, не создавать запись.

## 32.12. CommentsIsland и загрузка

Статья и featured comments рендерятся Astro.

React island отвечает только за динамику:

``` text
form submit
newest comments fetch
pagination
reply
Pomocne
Zgłoś
optimistic/local UI state
```

Не превращать всю статью или весь comment section в client-rendered
React без необходимости.

Динамические комментарии можно загружать при приближении пользователя к
секции комментариев.

Статические featured comments доступны без JS.

## 32.13. article_stats и comments_count

Публичное количество комментариев хранить агрегированно:

``` text
article_stats.comments_count
```

Изменения:

``` text
new published             → +1
pending → published       → +1
published → spam          → -1
delete published          → -1
spam → published          → +1
```

Не выполнять `COUNT(*)` по comments на каждый публичный запрос статьи.

`comments_count` может попадать в общий cached stats snapshot вместе с
`reads`.

## 32.14. Админка комментариев

Админка намеренно состоит из одной страницы:

``` text
/admin/comments
```

Не создавать отдельные страницы:

``` text
/admin/comments/pending
/admin/comments/spam
/admin/comments/:id
/admin/reports
/admin/users
/admin/settings
```

Вся работа --- через фильтры/табы на одном экране:

``` text
Komentarze

[Do sprawdzenia 7] [Opublikowane] [Spam]

Projekt: Wszystkie ▼   // показывать только при multi-site
```

`Do sprawdzenia` объединяет:

``` text
status = pending
OR
(status = published AND reports_count > 0)
```

Карточка pending с URL:

``` text
Jan
Artykuł: ...

Treść komentarza ... https://example.com

⚠ Zawiera link

Link rel:
[dofollow ▼]

Pomocne:
[ 34 ]

[Opublikuj] [Spam] [Usuń]
```

Для обычного pending:

``` text
[Opublikuj] [Spam] [Usuń]
```

Для reported published:

``` text
[Zostaw] [Spam] [Usuń]
```

`Zostaw` сбрасывает `reports_count`.

Для spam:

``` text
[Przywróć] [Usuń]
```

Допустима массовая операция:

``` text
[Usuń cały spam]
```

В `Opublikowane` администратор должен иметь возможность:

``` text
найти комментарий
изменить helpful_count
изменить link_rel для разрешённой ссылки
перевести в spam
удалить
```

Не добавлять редактор текста комментария без отдельного требования. Цель
админки --- модерация и управление параметрами, а не CMS.

## 32.15. Admin API

Минимально:

``` text
GET    /admin/api/comments?status=...&siteId=...&cursor=...
PATCH  /admin/api/comments/{id}
DELETE /admin/api/comments/{id}
POST   /admin/api/comments/spam/purge   // optional
```

`PATCH` может менять только явно разрешённые административные поля:

``` text
status
reports_count
helpful_count
link_rel
```

`body` и `author_name` через PATCH v1 не редактируются.

Backend валидирует допустимые переходы и published invariant раздела
32.5:

``` text
published + 0 URL
→ link_rel = null

published + 1 valid URL
→ link_rel required/allowed enum

published + 2+ URL
→ transition rejected
```

`helpful_count < 0` запрещён. `link_rel` --- только enum
`dofollow|nofollow|sponsored|null`.

Не делать универсальный arbitrary-record PATCH.

## 32.16. Авторизация админки

Не создавать собственную систему авторизации.

Админский route Worker защищается Cloudflare Access, например:

``` text
api.tragarze.pl/admin/*
```

Следовательно, в D1 не нужны:

``` text
admin_users
password_hashes
sessions
password_reset_tokens
own JWT auth
own 2FA
```

Worker всё равно должен отделять public `/v1/*` от protected `/admin/*`
и не полагаться на скрытую ссылку как на защиту.

## 32.17. Multi-site

Все операции комментариев используют пару:

``` text
site_id + article_id
```

Нельзя определять статью только по slug.

`article_id` --- стабильный ID из frontmatter и не меняется при смене
URL/slug.

Один Worker/D1 может обслуживать несколько блогов. Админка при этом
получает фильтр проекта; для одного сайта фильтр скрывается.

## 32.18. Что Codex не должен усложнять

При реализации v1 запрещено без отдельного требования добавлять:

``` text
полноценную CMS комментариев
user accounts
email
OAuth
moderator roles hierarchy
complex permissions
ML anti-spam
full-text moderation engine
comment edit history
soft-delete framework
realtime subscriptions
WebSockets
Redis
queues только ради комментариев
отдельный backend server
отдельный search service
```

Целевая модель:

``` text
Astro static HTML
+ React island для интерактива
+ один Cloudflare Worker
+ D1
+ Turnstile
+ Cloudflare Access для /admin/*
```

При выборе между более универсальной архитектурой и этой простой моделью
Codex должен предпочесть простую модель, пока SPEC явно не требует
обратного.

<a id="section-33"></a>
# 33. Mobile-first

Проектировать сначала для:

``` text
320–430px
```

Проверять:

``` text
320
360
375
390
430
768
1024
1440
```

iPhone 13 mini --- важный компактный baseline.

Запрещены:

``` text
horizontal overflow
desktop-first hacks
tiny controls
перегруженный header
```

------------------------------------------------------------------------

<a id="section-34"></a>
# 34. Touch targets

Интерактивные зоны ориентировочно:

``` text
44 × 44 CSS px
```

Особенно:

``` text
menu
share
article info
pagination
back
language switcher
comments actions
```

Иконка может быть меньше, touch area --- нет.

------------------------------------------------------------------------

<a id="section-35"></a>
# 35. Typography

Приоритет --- чтение длинного текста.

Ориентиры:

``` text
body mobile: 16–18px
line-height: 1.55–1.7
desktop article: 60–75 символов в строке
```

Не растягивать статью на весь desktop.

Использовать `clamp()` там, где это реально упрощает responsive
typography.

------------------------------------------------------------------------

<a id="section-36"></a>
# 36. CSS

Предпочитать:

``` text
modern CSS
CSS custom properties
Astro scoped styles
маленькие reusable primitives
```

Не использовать Bootstrap.

Не подключать Tailwind автоматически.

Theme может иметь собственные:

``` css
--color-*
--space-*
--font-*
--radius-*
--border-*
--shadow-*
--content-width
--page-width
```

CORE не знает их значений.

------------------------------------------------------------------------

<a id="section-37"></a>
# 37. Images

Использовать Astro image tooling, где это уместно.

Требования:

``` text
известные размеры/aspect ratio
responsive srcset/sizes
современные форматы
lazy below fold
LCP image не lazy
LCP candidate имеет известные width/height или aspect-ratio
для подтверждённого hero/LCP image допустим `fetchpriority="high"`
не preload-ить изображения без доказанной необходимости
минимум CLS
обязательный содержательный alt для контентных изображений
пустой alt только для действительно декоративных изображений
```

Hero image статьи и OpenGraph/social image --- разные семантические
роли. По умолчанию OG может использовать hero image, если он пригоден
для social crop; PROJECT обязан иметь fallback OG image. Статья может
отдельно переопределить `socialImage`.

Для social preview starter генерирует совместимый raster asset:

``` text
default canvas: 1200×630 px (≈1.91:1)
format: JPG или PNG
public absolute URL
не использовать AVIF/WebP как единственный og:image
```

1200×630 --- project default для широкой совместимости, а не утверждение
о единственном стандарте всех платформ. Если конкретная платформа
требует иной точный размер, THEME/PROJECT может добавить дополнительный
variant.

SEO renderer должен уметь отдавать как минимум:

``` text
og:image
og:image:width
og:image:height
og:image:alt
og:image:type
Twitter/X card metadata (summary_large_image или project-selected equivalent)
```

Не отдавать mobile устройству неоправданно огромные content images;
social crawler asset не должен определять размер изображения,
загружаемого в article layout.

------------------------------------------------------------------------

<a id="section-38"></a>
# 38. Fonts

Предпочитать self-hosting.

Использовать:

``` text
только нужные subsets
только нужные weights
WOFF2 where practical
font-display: swap
минимальный preload
```

Не preload всех файлов.

Preload допустим только для действительно critical font files,
используемых above-fold. Fallback stack должен быть подобран так, чтобы
загрузка webfont не создавала заметный layout shift; при необходимости
THEME может использовать font metric overrides (`size-adjust` /
ascent/descent overrides) вместо загрузки дополнительных JS/font
loaders.

------------------------------------------------------------------------

<a id="section-39"></a>
# 39. JS budget

Не hydrate:

``` text
article text
breadcrumbs
static cards
normal links
static ToC
static metadata
footer
```

Каждый island должен иметь явную причину существования.

Qualified-read detector должен быть маленьким обычным JS/feature, а не
React island, если React ему не нужен.

------------------------------------------------------------------------

<a id="section-40"></a>
# 40. Islands

Не создавать глобальный React App.

Допустимые islands:

``` text
Comments
Search
Calculator
InteractiveFilter
```

Reads detector --- предпочтительно tiny script.

------------------------------------------------------------------------

<a id="section-41"></a>
# 41. ToC

Генерировать build-time.

Не использовать React только ради списка заголовков.

Mobile --- допустим native `<details>`.

Desktop --- optional sticky ToC.

Использовать `scroll-margin-top`.

------------------------------------------------------------------------

<a id="section-42"></a>
# 42. Progressive enhancement

Если Worker/D1 недоступны:

``` text
статья работает
навигация работает
SEO работает
изображения работают
related работает
```

Пропадает только динамика.

------------------------------------------------------------------------

<a id="section-43"></a>
# 43. Worker

Worker --- отдельное приложение `/worker`.

Astro не зависит от Worker runtime.

Допустимо:

``` text
Astro → обычный static hosting
Worker → Cloudflare
D1 → Cloudflare
```

------------------------------------------------------------------------

<a id="section-44"></a>
# 44. Multi-project backend

Backend поддерживает:

``` text
site_id + article_id
```

Один Worker/D1 может обслуживать несколько сайтов.

Либо проект может иметь отдельный Worker/D1.

Frontend architecture при переключении не меняется.

------------------------------------------------------------------------

<a id="section-45"></a>
# 45. API abstraction

Не hardcode URL Worker по компонентам.

Использовать функции вроде:

``` text
recordRead()
getArticleStats()
```

Comments API реализуется согласно разделу 32; URL Worker не hardcode-ить
внутри UI-компонентов.

------------------------------------------------------------------------

<a id="section-46"></a>
# 46. Security

Worker:

``` text
проверяет Origin
проверяет site_id
связывает site_id с разрешёнными origins
валидирует method
валидирует Content-Type
ограничивает body
использует prepared D1 statements
не раскрывает stack trace
```

Не доверять `site_id` только потому, что его прислал browser.

------------------------------------------------------------------------

<a id="section-47"></a>
# 47. CORS

Mutation endpoints --- только explicit origins.

Production wildcard CORS для write endpoints запрещён.

Localhost разрешается в development.

------------------------------------------------------------------------

## 47.1. Rate limiting mutation API

Публичные mutation endpoints должны иметь лёгкое route-specific rate
limiting независимо от Turnstile. Это защита от случайного/простого
abuse, а не система точного биллинга или идентификации пользователей.

Покрыть минимум:

``` text
POST /v1/comments
POST /v1/comments/{id}/helpful
POST /v1/comments/{id}/report
POST /v1/articles/{articleId}/rating
POST /v1/read
```

Предпочтительно использовать Cloudflare Workers Rate Limiting binding
или эквивалентный edge-механизм. Лимиты задаются config и могут
отличаться по endpoint. При превышении возвращать
`429 Too Many Requests`.

Не хранить raw IP в D1 ради rate limiting и не строить fingerprinting.
Для resource-specific limits допустимо сочетать route/resource ID с
анонимным `visitor_id`, если это не создаёт постоянный профиль
пользователя. Turnstile остаётся обязательным для создания комментария и
не заменяется rate limiter.

Лимиты не должны быть настолько агрессивными, чтобы обычный пользователь
за NAT/mobile network регулярно блокировался.

------------------------------------------------------------------------

<a id="section-48"></a>
# 48. Request budget

Типичная статья:

``` text
0 API requests для основного контента
0 request при простом открытии без qualified read
1 POST только после 10 sec OR 25% scroll
comments загружаются только когда действительно нужны
```

Listing:

``` text
не N requests на N карточек
один cached stats snapshot при необходимости
```

------------------------------------------------------------------------

<a id="section-49"></a>
# 49. Core Web Vitals

Контролировать:

``` text
LCP
CLS
INP
TTFB
```

Primary field targets для representative public pages:

``` text
LCP ≤ 2.5 s
INP ≤ 200 ms
CLS ≤ 0.1
```

Оценивать Core Web Vitals прежде всего по реальным field data на 75-м
percentile, отдельно для mobile и desktop, когда данных уже достаточно.

Lighthouse используется как лабораторный диагностический инструмент, но
не подменяет field data.

Приоритет:

``` text
быстро показать полезный текст
минимальный critical JS
стабильный layout
лёгкие изображения
лёгкие fonts
минимальная hydration
```

Не оптимизировать ради формального score ценой ухудшения читаемости,
accessibility или понятности интерфейса.

------------------------------------------------------------------------

<a id="section-50"></a>
# 50. Lighthouse

Ориентир для representative production pages:

``` text
Performance      95+
Accessibility    95+
Best Practices   95+
SEO              95+
```

Не жертвовать UX ради искусственных 100.

------------------------------------------------------------------------

<a id="section-51"></a>
# 51. Accessibility

Использовать semantic HTML:

``` text
header
nav
main
article
aside
footer
time
button
form
label
```

Требования:

``` text
keyboard
visible focus
labels
errors association
alt
aria-hidden decorative icons
heading hierarchy
accessible language switcher
accessible info/share controls
```

Дополнительно:

-   на каждой public page есть один понятный `<main>`;
-   keyboard focus не скрывается sticky header/footer;
-   для длинных страниц рекомендуется visible-on-focus skip link к
    основному контенту;
-   async form/status updates сообщаются через доступный status/error
    pattern, без спама `aria-live`;
-   после modal/dialog закрытия focus возвращается к trigger;
-   loading state не должен заменять уже доступный статический контент
    пустым экраном;
-   интерфейс остаётся usable при text zoom и narrow viewport без
    горизонтального scrolling основного документа.

------------------------------------------------------------------------

<a id="section-52"></a>
# 52. SEO

Build-time/render-time:

``` text
title
description
canonical
robots
OpenGraph
social metadata
Article JSON-LD
BreadcrumbList
Person/Organization
```

Для статьи:

``` text
H1 = title
<title> = seoTitle ?? title
```

Дата публикации/изменения берётся из content data.

Не дублировать schema вручную в MDX.

Draft/scheduled не должны становиться публичными SEO-document. `noindex`
должен влиять на robots и sitemap согласно правилам этой спецификации.

SEO contract не оправдывает создание thin/duplicated pages только ради
keyword combinations. Каждая indexable page должна иметь самостоятельный
пользовательский intent, полезный основной контент и внутреннюю роль в
информационной архитектуре.

Structured data описывает реально видимый/существующий content и не
используется как замена содержанию страницы.

------------------------------------------------------------------------

<a id="section-53"></a>
# 53. Multilingual SEO

Корректно генерировать:

``` text
canonical
hreflang
x-default
localized OG
localized structured data
localized sitemap
```

Не создавать alternate для отсутствующего перевода.

------------------------------------------------------------------------

<a id="section-54"></a>
# 54. Sitemap и RSS

Поддерживать:

``` text
sitemap.xml
RSS
```

## Sitemap

В sitemap включается только опубликованный indexable canonical content.

Не включать:

``` text
draft
scheduled
noindex
redirect source URLs
технические preview/dev routes
```

`lastmod`:

``` text
updatedDate ?? publishDate
```

Учитывать locale и реальные существующие переводы.

## RSS

RSS содержит только published content соответствующего feed/locale.

Минимальные поля:

``` text
stable GUID
title
description/summary
absolute URL
publishDate
updatedDate если применимо
author
category
```

GUID не должен зависеть только от изменяемого slug. Использовать
стабильную идентичность статьи/стабильный canonical mapping.

По умолчанию RSS может отдавать summary/description, а не полный MDX.
Полный article HTML в feed не является обязательным требованием starter.

------------------------------------------------------------------------

<a id="section-55"></a>
# 55. Related/internal linking

Build-time helpers:

``` text
explicit related
category
tags
pillar/cluster
localized relations
previous/next
```

Проектные коммерческие ссылки не hardcode в CORE.

------------------------------------------------------------------------

<a id="section-56"></a>
# 56. Dates

Использовать:

``` html
Runtime timestamps в D1 используют только INTEGER Unix epoch milliseconds UTC согласно разделу 85.
```

Форматирование --- через `Intl` и текущий locale.

Не hardcode польский формат в CORE.

Контентные даты хранятся в однозначном ISO-совместимом формате. PROJECT
задаёт timezone, используемую для определения scheduled publication и
человеко-понятного отображения дат.

Для tragarze.pl:

``` text
Europe/Warsaw
```

------------------------------------------------------------------------

<a id="section-57"></a>
# 57. No-JS

Без JavaScript должны работать:

``` text
navigation
article
breadcrumbs
static ToC
related
previous/next
images
SEO HTML
статически сгенерированные language links
```

Не работают только dynamic features.

------------------------------------------------------------------------

<a id="section-58"></a>
# 58. TypeScript

Strict TypeScript.

Минимум `any`.

API contracts должны быть типизированы.

------------------------------------------------------------------------

<a id="section-59"></a>
# 59. Dependencies

Каждая dependency должна быть оправдана.

Предпочитать:

``` text
Web APIs
Intl
Astro primitives
native HTML
modern CSS
```

------------------------------------------------------------------------

<a id="section-60"></a>
# 60. Code quality

``` text
маленькие функции
маленькие компоненты
ясные имена
нет duplicated business logic
нет giant React components
нет dead code
нет старых закомментированных реализаций
```

------------------------------------------------------------------------

<a id="section-61"></a>
# 61. Build scripts

Предусмотреть:

``` text
dev
build
preview
check
typecheck
lint
format
new:article
```

`new:article` --- небольшой project-aware script, а не тяжёлый wizard.
Он создаёт MDX-заготовку с новым стабильным `id`, обязательным
frontmatter и безопасными placeholder-значениями.

Production build проверяет Astro, TypeScript, content schema и
расширенную content validation из раздела 17.2.

------------------------------------------------------------------------

<a id="section-62"></a>
# 62. Tests

Тестировать критические reusable части:

``` text
slug/routes
listing pagination
redirect resolution/loops/chains
redirect exporter + expected HTTP 301 contract for selected deploy target
translation relations
canonical
hreflang
sitemap filtering
RSS filtering/GUID stability
content validation
draft/scheduled publication rules
read deduplication logic
comments moderation routing
comments keyset cursor stability + featuredIds exclusion across all dynamic pages
API origin/site validation
mutation rate limiting / 429 behavior
input validation
```

Не создавать избыточный enterprise test suite.

------------------------------------------------------------------------

<a id="section-63"></a>
# 63. Environment

`.env.example`:

``` env
PUBLIC_API_URL=
PUBLIC_SITE_ID=
PUBLIC_TURNSTILE_SITE_KEY=
```

Turnstile variables нужны только если comments/другой feature его
использует.

Secrets не должны попадать во frontend.

------------------------------------------------------------------------

<a id="section-64"></a>
# 64. Documentation

README должен объяснять:

``` text
install
dev
project config
CORE / FEATURES / THEME / PROJECT
theme customization
content
categories
authors data
i18n
translations
feature flags
reads
comments/moderation
Worker local dev
environment
build/deploy
cloning
```

Отдельно описать редакционный workflow публикации:

``` text
1. npm run new:article
2. заполнить frontmatter
3. написать/отредактировать MDX
4. добавить hero/media и alt
5. npm run check
6. локальный preview
7. build
8. deploy
```

Также описать:

``` text
как обновлять опубликованную статью
когда менять updatedDate
как менять slug и добавлять redirectFrom
как снимать материал с публикации
как создавать scheduled/draft материал
```

Cloudflare setup --- отдельно:

``` text
docs/CLOUDFLARE_SETUP.md
```

------------------------------------------------------------------------

<a id="section-65"></a>
# 65. Git и reusable-проверка

После клонирования новый проект должен в основном менять:

``` text
project config
theme
branding
navigation
content
environment
backend site registration
```

Перед признанием starter универсальным проверить отсутствие скрытых
ссылок на tragarze.pl.

------------------------------------------------------------------------

<a id="section-66"></a>
# 66. Motion

Короткие transitions:

``` text
100–200ms
```

только если улучшают понятность.

Учитывать:

``` css
prefers-reduced-motion
```

Не использовать тяжёлые page-transition/animation libraries без причины.

------------------------------------------------------------------------

<a id="section-67"></a>
# 67. Порядок приоритетов UX

При выборе реализации:

``` text
1. простота для пользователя
2. реальная и воспринимаемая скорость
3. accessibility
4. maintainability
5. визуальный эффект
```

------------------------------------------------------------------------

<a id="section-68"></a>
# 68. Future-proofing без переусложнения

Позже Worker может поддерживать дополнительные функции:

``` text
recommendations
Polecam / Nie polecam
leads
forms
firms
newsletter
```

Но не реализовывать заранее.

Не создавать speculative abstractions.

------------------------------------------------------------------------

<a id="section-69"></a>
# 69. Порядок разработки Codex

``` text
1. Astro scaffold
2. CORE / FEATURES / THEME / PROJECT
3. strict TypeScript
4. Content Collections + lifecycle + content validation
5. i18n
6. translation relations + stable article ID
7. routing + listing pagination + redirects
8. multilingual SEO + sitemap + RSS
9. tragarze theme
10. mobile-first layouts
11. article + previews + MDX component registry
12. info/share controls
13. images/fonts/performance
14. tiny qualified-read detector
15. Worker
16. минимальная D1 read statistics
17. hourly/cached stats snapshot
18. comments public API + Turnstile + moderation rules
19. CommentsIsland + pagination + static TOP-5 integration
20. one-page admin + Cloudflare Access
21. accessibility pass
22. tests
23. documentation + editorial workflow
24. final cleanup
```

Редакционную модель, `/redakcja/`, персональные профили и связи
authors/contributors реализовывать по разделу 17.5 без самостоятельного
расширения ролей или URL-схемы.

------------------------------------------------------------------------

<a id="section-70"></a>
# 70. Definition of Done

Готово, когда:

1.  Репозиторий клонируется для нового проекта.

2.  CORE не содержит tragarze-specific дизайна/логики.

3.  FEATURES независимы от темы.

4.  THEME полностью принадлежит проекту.

5.  PROJECT config разделён и type-safe.

6.  i18n существует сразу.

7.  Одноязычный режим не требует locale prefix.

8.  Многоязычный режим не требует архитектурной переделки.

9.  Переводы связаны не по slug.

10. Статья имеет стабильный `article_id`.

11. MDX и связанные сущности валидируются.

12. Draft/scheduled/noindex имеют однозначные build-time правила.

13. Смена URL поддерживает реальный HTTP 301 на выбранном production
    hosting; meta refresh не считается выполнением требования.

14. Redirect manifest/exporter не привязан к Cloudflare Pages как к
    единственному hosting target.

15. Listing/category pagination работает без `/page/1/`.

16. Sitemap/RSS корректно фильтруют непубличный контент.

17. Основной контент static.

18. React используется только где нужен.

19. Read считается только после 10 секунд ИЛИ 25% статьи.

20. Простое открытие страницы не увеличивает read.

21. На одной загрузке страницы отправляется максимум одно read-event.

22. Очевидные повторы deduplicate без сложной аналитики.

23. Публично нет returning-reader аналитики.

24. Stats могут обновляться примерно раз в час.

25. Listing не создаёт N API calls.

26. Worker независим от Astro hosting.

27. D1 поддерживает site separation.

28. Нет raw-IP identity/fingerprinting.

29. Нет secrets во frontend/Git.

30. Нормальный комментарий без ссылок может auto-publish.

31. Любой комментарий с 1+ ссылкой уходит в pending.

32. Turnstile валидируется server-side до записи нормального comment
    request.

33. Невалидные/обходящие client limits запросы reject и не сохраняются
    как moderation spam.

34. Comment links выводятся безопасно, а `rel` управляется модератором.

35. `Pomocne` работает, `helpful_count` доступен для ручной
    корректировки администратором.

36. TOP-5 комментариев встраиваются в HTML только первой страницы
    comments pagination и исключены из всей динамической пагинации.

37. Со второй страницы comments pagination отображается только обычная
    хронология non-featured comments через стабильный keyset cursor.

38. Публичные mutation endpoints имеют разумный route-specific rate
    limiting и возвращают 429 при превышении.

39. One-page comments admin защищён Cloudflare Access без собственной
    auth system.

40. 320px не имеет overflow.

41. Touch targets удобны.

42. Нет avoidable CLS.

43. Статья читается без JS.

44. Worker failure не ломает static site.

45. Strict TypeScript/build проходят.

46. Accessibility/performance проверены.

47. `/redakcja/` и персональные профили генерируются статически из
    единой модели Person.

48. Статьи поддерживают `authors[]` и `contributors[]`, включая
    совместное авторство и редакционную проверку.

49. Профили автоматически показывают авторские и редакторские публикации
    без ручного `articles:` списка.

50. Article/ProfilePage/Person structured data связывают статью с
    публичным профилем автора.

51. README описывает не только clone/setup, но и полный editorial
    workflow.

52. Рейтинг статьи реализован строго по утверждённому контракту раздела 75; Codex не заменяет его собственной моделью голосования, агрегирования или сортировки.

<a id="section-71"></a>
# 71. Финальный технический аудит

Перед завершением проверить:

``` text
bundle sizes
unused JS
hydration
dependencies
fonts
images
LCP
CLS
INP
network requests
waterfalls
mobile overflow
touch targets
focus
semantic HTML
ARIA
headings
language switching
hreflang
canonical
OG/social raster dimensions + metadata
JSON-LD
sitemap
RSS
404
API errors
CORS
Origin/site matching
read deduplication
D1 indexes
D1 queries
migrations
secret handling
```

Representative article проверить:

``` text
small mobile
cold cache
throttled network
Worker unavailable
without JavaScript
10 sec read trigger
25% scroll trigger
оба trigger в одной сессии — только 1 POST
```

Для каждого client-side запроса/island/dependency задавать вопрос:

> Нужен ли он пользователю именно сейчас?

Если нет:

``` text
убрать
перенести на build-time
lazy-load
или отложить до interaction
```

------------------------------------------------------------------------

<a id="section-72"></a>
# 72. Правило living specification

`SPEC.md` --- основной источник технических требований.

При изменении требований:

1.  сначала обновить `SPEC.md`;
2.  затем реализацию;
3.  не допускать скрытого расхождения;
4.  архитектурные решения, найденные в ходе разработки, сначала
    документировать.

Project-specific документы хранить отдельно, например:

``` text
docs/TRAGARZE_THEME.md
docs/TRAGARZE_CONTENT.md
docs/CLOUDFLARE_SETUP.md
```

Это не позволяет требованиям одного проекта загрязнять reusable CORE.

<a id="section-73"></a>
# 73. Пользовательская страница 404 --- обязательная функция

Starter обязан иметь полноценную проектную страницу `404`, а не
полагаться на стандартную страницу ошибки хостинга.

## 73.1. Файл, сборка и HTTP-статус

Astro SSG проект содержит `src/pages/404.astro`. Страница относится к
THEME/PROJECT presentation layer и собирается вместе с сайтом.

Deploy adapter обязан настраивать целевой static/shared hosting так,
чтобы любой неизвестный URL:

-   возвращал настоящий HTTP `404 Not Found`;
-   показывал проектную 404;
-   не перенаправлял пользователя на `/404/`;
-   не возвращал `200 OK` (soft-404).

После deployment это обязательно проверяется запросом `curl -I` к
заведомо несуществующему URL. Ожидаемый HTTP status --- `404`.

## 73.2. URL и индексация

При ошибке браузер сохраняет исходный URL. 404 не включается в sitemap,
RSS, списки публикаций, related content и внутренний поисковый индекс
как самостоятельный документ.

## 73.3. UI

404 использует общий THEME проекта: Header, Footer, typography, spacing,
navigation и mobile-first layout.

Минимальный интерфейс:

``` text
404
Страница не найдена

Короткое понятное объяснение.

[На главную]
[К публикациям]
```

Строки локализуются через i18n и не хардкодятся в CORE. Если feature
поиска включена, THEME может добавить поиск. Допустимы ссылки на
основные категории или несколько полезных публикаций, но 404 не должна
превращаться в тяжёлую landing page.

## 73.4. i18n

Для multilingual-проекта 404 по возможности использует locale исходного
URL. Если locale достоверно определить нельзя, используется
`defaultLocale`.

Минимальные i18n-ключи: `title`, `message`, `homeLabel`,
`publicationsLabel`.

## 73.5. Различие 301 / 410 / 404

Codex обязан различать:

``` text
URL изменён
→ настоящий HTTP 301

Материал сознательно удалён без замены и hosting поддерживает правило
→ HTTP 410

Неизвестный/никогда не существовавший URL либо 410 недоступен
→ HTTP 404 + проектная 404
```

Нельзя заменять эти случаи client-side redirect или страницей с HTTP
200.

## 73.6. Definition of Done

404 считается реализованной только если:

-   существует `src/pages/404.astro`;
-   страница соответствует THEME и проверена на mobile;
-   строки локализуемы;
-   production build создаёт 404 document;
-   неизвестный URL показывает проектную 404;
-   сервер реально отвечает HTTP 404;
-   исходный ошибочный URL сохраняется;
-   404 отсутствует в sitemap и RSS;
-   deploy adapter/documentation содержит настройку custom 404 для
    выбранного hosting.

<a id="section-74"></a>
# 74. Content Discovery, сортировка публикаций и пагинация

Content Discovery является обязательным пользовательским contract:
читатель должен предсказуемо находить новые, актуально популярные,
обсуждаемые, высоко оценённые и недавно содержательно обновлённые
публикации без превращения блога в перегруженный портал.

## 74.1. Content Discovery Contract

Базовая семантика:

``` text
BLOG HOME
→ Featured
→ Popularne teraz
→ Najnowsze
→ Categories

CATEGORY
→ category title/description
→ sort selector
→ article list
→ pagination

AUTHOR
→ author information
→ authored publications sort selector
→ article list
→ pagination

ARTICLE
→ Related
→ Previous / Next
→ author block
→ more from author where useful
```

THEME определяет композицию и визуальный вид. FEATURE/CORE определяют
семантику, источники данных, URL-state и fallback.

Не требуется показывать все discovery-блоки одновременно. THEME должен
избегать дублирования трёх разных блоков с почти одинаковыми статьями.

## 74.2. Канонические sort keys v1

``` text
newest
popularNow
popular
rating
comments
updated
```

Семантика:

``` text
newest
→ MDX publishDate DESC

popularNow
→ rolling qualified reads за PROJECT-configurable окно
→ default popularityWindowDays = 7

popular
→ all-time article_stats.reads DESC

rating
→ Bayesian ratingScore согласно разделу 75

comments
→ published article_stats.comments_count DESC

updated
→ только MDX updatedDate DESC
→ статья без updatedDate не считается "обновлённой"
```

Польские labels являются UI/i18n, не CORE constants:

``` text
Najnowsze
Popularne teraz
Popularne
Najlepiej oceniane
Dyskutowane
Ostatnio aktualizowane
```

## 74.3. Allowlist по поверхности

BLOG HOME discovery defaults:

``` text
Featured
Popularne teraz
Najnowsze
Categories
```

Главная не обязана иметь общий sort selector.

CATEGORY selector v1:

``` text
newest
popularNow
rating
comments
updated
```

AUTHOR authored-publications selector v1:

``` text
newest
popular
comments
updated
```

Rating на author page не является обязательным пользовательским
сценарием. `popularNow` на author page также не является default:
`popular` показывает наиболее читаемые работы автора в целом.

Reusable collection явно передаёт `allowedSorts`; CORE не предполагает,
что каждый sort доступен в каждом UI.

## 74.4. Default sort

Для обычного category/author listing:

``` text
sort = newest
```

Default sort не обязан присутствовать в query string.

``` text
/blog/porady/
```

предпочтительнее:

``` text
/blog/porady/?sort=newest
```

`?sort=newest` может быть безопасно нормализован до базового URL.

## 74.5. Главное UX-правило смены sort

Номер страницы относится к конкретному порядку выдачи.

Любая смена:

``` text
sort A, page N
→ sort B
→ sort B, page 1
```

Пример:

``` text
/blog/porady/page/4/?sort=rating
→ пользователь выбирает updated
→ /blog/porady/?sort=updated
```

Сохранять `page=N` при смене sort запрещено.

## 74.6. Pagination после выбора sort

После выбора sort дальнейшая pagination сохраняет его:

``` text
/blog/porady/?sort=rating
/blog/porady/page/2/?sort=rating
/blog/porady/page/3/?sort=rating
```

Page 1 никогда не получает `/page/1/`.

Browser Back/Forward должен восстанавливать URL-state и выбранный sort.

## 74.7. Category contract

``` text
/blog/{category}/
→ newest, page 1
```

Category intro остаётся content/editorial частью страницы и не меняется
при client-side sort.

Selector:

``` text
newest | popularNow | rating | comments | updated
```

`updated` особенно полезен вместе с `updateNote`: карточка MAY показывать
`updatedDate + updateNote`, если note существует.

## 74.8. Author contract

Основной authored listing:

``` text
/{localized-editorial-segment}/{person-slug}/
```

Selector:

``` text
newest | popular | comments | updated
```

Сортировка применяется только к authored publications данного блока.
Editorial/reviewed contributions MAY использовать отдельный простой
`newest` listing без selector.

## 74.9. Blog home discovery blocks

Recommended v1 composition:

``` text
Featured
→ editorial decision from MDX/project rules

Popularne teraz
→ popularNow rolling ranking

Najnowsze
→ publishDate DESC

Categories
→ navigation/discovery
```

`Featured` не вычисляется из reads/rating/comments.

`Popularne teraz` не может быть псевдонимом all-time `reads`.

`Najnowsze` является build-time и не требует runtime API.

THEME должен дедуплицировать или разумно ограничивать повторение одной и
той же статьи между соседними home blocks, если повторение ухудшает UX.
Точная визуальная стратегия принадлежит THEME.

## 74.10. Recently updated contract

`updated` использует только содержательное `updatedDate` из MDX.

Tie-breakers:

``` text
updatedDate DESC
publishDate DESC
article_id ASC
```

Статьи без `updatedDate`:

``` text
CATEGORY updated listing
→ исключаются из updated ranking/listing

AUTHOR updated listing
→ исключаются из updated ranking/listing
```

Нельзя подставлять `publishDate` как fake update date.

Если `updateNote` существует, card/list MAY показать:

``` text
visible updatedDate
+
short updateNote
```

`updateNote` не влияет на ranking.

## 74.11. Stable ordering и tie-breakers

``` text
newest:
publishDate DESC,
article_id ASC

popularNow:
rolling_reads DESC,
publishDate DESC,
article_id ASC

popular:
reads DESC,
publishDate DESC,
article_id ASC

comments:
comments_count DESC,
publishDate DESC,
article_id ASC

rating:
rating_score DESC,
rating_count DESC,
publishDate DESC,
article_id ASC

updated:
updatedDate DESC,
publishDate DESC,
article_id ASC
```

`rating_score` является internal ranking signal и не публикуется как
display value.

## 74.12. Build-time vs runtime ownership

Build-time/editorial sorts:

``` text
newest
updated
```

источником имеют MDX и generated listing/discovery manifest.

Runtime sorts:

``` text
popularNow
popular
rating
comments
```

источником порядка имеют Worker/D1 ranking snapshot.

Ни generated manifest, ни cached build snapshot не становятся новым
source of truth.

## 74.13. Reusable collection contract

Концептуально:

``` text
source
sort
limit
pagination
allowedSorts
```

Пример:

``` tsx
<ArticleCollection
  source="category"
  category="porady"
  sort="newest"
  allowedSorts={["newest", "popularNow", "rating", "comments", "updated"]}
  pagination={true}
/>
```

Синтаксис implementation может отличаться; семантика нет.

## 74.14. Dynamic metrics и SSG

Runtime sort не требует rebuild после каждого read/comment/vote.

Используется единый cached stats/ranking snapshot.

Требования:

- один listing не делает N API requests;
- dynamic ranking приходит batch/snapshot способом;
- snapshot eventually consistent;
- недоступность API не ломает static `newest` HTML;
- failure dynamic sort → localized error/fallback to newest;
- `popularNow` обновляется по rolling aggregates, а не по rebuild MDX.

## 74.15. URL, canonical и SEO

Формат:

``` text
/page/N/?sort={sort}
```

Page 1 без `/page/1/`.

Для query-sort canonical указывает на соответствующую базовую pagination
страницу без `sort`:

``` text
/blog/porady/?sort=rating
→ canonical /blog/porady/

/blog/porady/page/2/?sort=rating
→ canonical /blog/porady/page/2/
```

Sort control является UI-control, а не отдельной SEO navigation taxonomy.
Starter не генерирует sitemap/hreflang/RSS entries для `?sort=`.

Не вводить blanket `noindex` для всех sort URL без отдельного PROJECT SEO
решения: canonical остаётся базовым duplicate-control contract.

## 74.16. Invalid sort и empty states

Разрешённые значения проверяются against surface allowlist.

``` text
invalid sort
→ safe fallback to newest
→ URL MAY normalize to base form
```

Если после source/filter нет статей, показывается локализованный empty
state. Sort сам по себе не создаёт 404 только из-за пустой коллекции.

## 74.17. Accessibility и interaction

Selector должен:

- иметь доступное имя;
- работать keyboard-only;
- иметь видимый focus;
- сообщать изменение выдачи screen reader where appropriate;
- не красть focus после async update;
- не вызывать layout jump без необходимости.

При смене sort список обновляется как одна логическая collection.

## 74.18. Definition of Done

- Content Discovery Contract реализован на home/category/author/article surfaces;
- category поддерживает `newest/popularNow/rating/comments/updated`;
- author поддерживает `newest/popular/comments/updated`;
- `Popularne teraz` использует rolling reads, не all-time reads;
- `updated` использует только MDX updatedDate;
- updateNote остаётся editorial metadata и не влияет на ranking;
- смена sort сбрасывает page на 1;
- pagination сохраняет sort;
- Back/Forward восстанавливает состояние;
- newest работает без dynamic API;
- dynamic sorts не делают N requests;
- tie-breakers детерминированы;
- canonical/URL соответствуют contract;
- invalid sort безопасно fallback-ится;
- selector доступен keyboard/screen reader.


<a id="section-75"></a>
# 75. Рейтинг статьи --- обязательный v1-контракт

Рейтинг статьи является обязательной частью v1 starter.

Он независим от комментариев и реакции `Pomocne`.

Цели:

``` text
дать читателю простой способ оценить материал;
публично показывать честный средний рейтинг и число оценок;
использовать рейтинг как один из сигналов сортировки публикаций;
не вводить аккаунты, fingerprinting и сложный anti-fraud;
не превращать рейтинг в тяжёлую analytics-систему.
```

## 75.1. Публичная модель

Шкала:

``` text
1–5
```

Визуальное представление:

``` text
★ ★ ★ ★ ★
```

Пользователь может поставить любую целую оценку:

``` text
1
2
3
4
5
```

Публично отображаются:

``` text
ratingValue
ratingCount
```

Пример:

``` text
4.6 ★
128 ocen
```

Если есть только одна оценка, она тоже показывается.

Пример:

``` text
5.0 ★
1 ocena
```

Нельзя скрывать рейтинг до достижения искусственного порога голосов.

Причина:

``` text
публичный UI показывает реальные агрегированные данные;
за статистическую устойчивость сортировки отвечает отдельный ratingScore;
публичный ratingValue не должен искажаться ради ранжирования.
```

Если:

``` text
ratingCount = 0
```

рейтинг может отображаться как пустое состояние / приглашение оценить
статью, но числовой aggregate rating не показывается.

## 75.2. Frontend UI

Минимальный интерфейс:

``` text
Oceń artykuł
☆ ☆ ☆ ☆ ☆
```

Если статья уже имеет оценки:

``` text
4.6 ★ · 128 ocen

Oceń artykuł
☆ ☆ ☆ ☆ ☆
```

После собственного голоса:

``` text
Twoja ocena: ★★★★☆
4.6 ★ · 129 ocen
```

THEME определяет конкретную визуальную композицию и локализованные
labels.

CORE/feature не должен хардкодить польский текст.

## 75.3. RatingIsland

Интерактивность реализуется отдельным маленьким React island:

``` text
src/features/rating/
├ core/
│  ├ api.ts
│  ├ state.ts
│  ├ helpers.ts
│  └ validation.ts
├ island/
│  └ RatingIsland.tsx
└ types/
   └ rating.ts
```

Island отвечает только за:

``` text
выбор оценки 1–5;
hover/focus preview;
POST rating;
optimistic UI;
обновление ratingValue/ratingCount;
отображение своей текущей оценки;
изменение уже поставленной оценки;
локализованное error state.
```

Не использовать rating island для общей article analytics, comments или
sorting UI.

## 75.4. Accessibility рейтинга

Звёзды не должны быть только набором кликабельных SVG.

Предпочтительная семантика:

``` text
radio group
```

с пятью доступными вариантами.

Пример accessible labels:

``` text
1 z 5
2 z 5
3 z 5
4 z 5
5 z 5
```

или эквивалент в locale.

Требования:

-   клавиатурное управление;
-   видимый focus state;
-   понятное selected state;
-   screen reader должен понимать текущую оценку;
-   SVG-звёзды декоративны и не заменяют control semantics;
-   после успешного POST результат должен быть доступно объявлен
    пользователю;
-   ошибка отправки не должна стирать ранее подтверждённую оценку.

## 75.5. Повторное голосование

Один anonymous visitor имеет одну активную оценку на статью.

Ключ:

``` text
site_id + article_id + visitor_id
```

Пользователь может изменить свою оценку позже.

Пример:

``` text
было: 3
новая оценка: 5
```

Агрегат:

``` text
rating_sum = rating_sum - 3 + 5
rating_count не меняется
```

Запрещено создавать второй активный голос того же `visitor_id` для той
же статьи.

## 75.6. Anonymous visitor identity

Аккаунты не требуются.

Используется случайный anonymous first-party `visitor_id`.

Предпочтительно:

``` text
Worker создаёт / устанавливает first-party cookie
```

а не принимает произвольный `visitor_id` из POST body как доверенный
идентификатор.

Требования:

-   случайный opaque ID;
-   не содержит персональные данные;
-   raw IP не хранится в D1 как идентификатор;
-   fingerprinting запрещён;
-   не строить cross-site identity;
-   не использовать rating identity как полноценную analytics identity.

Если пользователь очистил cookie/storage и технически может
проголосовать снова, это допустимый компромисс v1.

Не усложнять систему аккаунтами или device fingerprinting только ради
абсолютной защиты рейтинга.

## 75.7. Rating aggregates

Каноническая физическая схема `article_stats` определяется единым D1
Data Model contract.

Rating использует поля:

``` text
rating_sum
rating_count
```

и не создаёт отдельную конкурирующую версию таблицы.

Публичный средний рейтинг:

``` text
ratingValue =
rating_sum / rating_count
```

только если:

``` text
rating_count > 0
```

Не хранить `rating_avg` как обязательное отдельное поле, если его можно
безопасно вычислить из `rating_sum` и `rating_count`.

## 75.8. D1 schema --- индивидуальные голоса

Отдельная таблица:

``` text
article_rating_votes
- site_id
- article_id
- visitor_id
- value
- created_at_ms
- updated_at_ms
```

Обязательное ограничение:

``` text
UNIQUE(site_id, article_id, visitor_id)
```

`value`:

``` text
INTEGER
1..5
```

Таблица нужна для:

-   предотвращения обычных повторных голосов в рамках visitor ID;
-   изменения существующей оценки;
-   корректного пересчёта `rating_sum`.

Не добавлять в v1:

``` text
IP history
device fingerprint
user account
moderation state per vote
vote comments
vote reasons
```

## 75.9. Rating API

Public aggregate для карточек/initial display приходит из общего
`GET /v1/stats` snapshot.

Персонализированный lazy endpoint RatingIsland:

``` text
GET /v1/articles/{articleId}/rating
```

Response:

``` json
{
  "ratingValue": 4.63,
  "ratingCount": 128,
  "myRating": 4
}
```

Если visitor cookie отсутствует или этот visitor ещё не голосовал:

``` text
myRating = null
```

GET является персонализированным:

``` text
Cache-Control: private, no-store
```

и не должен попадать в shared CDN cache.

RatingIsland вызывает этот GET только при собственной hydration/activation
(предпочтительно когда control становится видимым/нужным), а не как
обязательный request для initial article HTML.

Публичный mutation endpoint:

``` text
POST /v1/articles/{articleId}/rating
```

Body:

``` json
{
  "value": 4
}
```

`articleId` --- стабильный article ID, а не slug.

`visitor_id` не передаётся как доверенный пользовательский идентификатор
в body.

Backend валидирует:

``` text
site identity from trusted origin mapping;
article_id enabled in content registry;
value integer;
value >= 1;
value <= 5;
rate limit;
visitor identity.
```

Успешный ответ:

``` json
{
  "ratingValue": 4.63,
  "ratingCount": 129,
  "myRating": 4
}
```

Backend возвращает агрегат после применённого голоса, чтобы frontend не
делал второй GET.

## 75.10. Atomic update

Первый голос:

``` text
insert article_rating_votes
rating_sum += value
rating_count += 1
```

Изменение существующего голоса:

``` text
old_value = existing vote
update article_rating_votes.value
rating_sum = rating_sum - old_value + new_value
rating_count unchanged
```

Операция обновления индивидуального голоса и агрегата должна быть
атомарной настолько, насколько позволяет выбранный D1/Worker transaction
pattern.

Нельзя допускать обычный сценарий:

``` text
vote updated
aggregate not updated
```

или наоборот.

## 75.11. Anti-abuse v1

Минимальная защита:

``` text
UNIQUE(site_id, article_id, visitor_id)
+
Worker Rate Limiting
```

Rating POST входит в общий mutation rate-limiting contract.

Turnstile на каждый клик рейтинга не требуется.

Причина:

``` text
Turnstile заметно ухудшает UX простого rating action;
для v1 достаточно anonymous dedup + rate limit;
система не заявляется как защищённая от мотивированной coordinated manipulation.
```

Если позже появится реальная проблема накрутки, anti-abuse усиливается
отдельным решением, не усложняя initial v1 заранее.

## 75.12. Public rating vs sorting score

Публично пользователь всегда видит реальный:

``` text
ratingValue
ratingCount
```

Сортировка `rating` НЕ должна использовать только голый `ratingValue`.

Причина:

``` text
5.0 / 1 голос
```

не должно автоматически ранжироваться выше:

``` text
4.8 / 300 голосов
```

Для сортировки используется отдельный внутренний:

``` text
ratingScore
```

`ratingScore` пользователю не показывается.

## 75.13. Bayesian ratingScore

Базовая формула v1:

``` text
ratingScore =
(v / (v + m)) * R
+
(m / (v + m)) * C
```

где:

``` text
R = реальный средний рейтинг конкретной статьи;
v = rating_count конкретной статьи;
C = средний рейтинг всех реальных оценок сайта;
m = минимальная статистическая масса.
```

Стартовое project-config значение:

``` text
m = 10
```

`m` является конфигурируемым параметром, но production validation
требует:

``` text
m > 0
```

Если на сайте нет ни одной реальной оценки:

``` text
siteRatingCount = 0
→ C = undefined
→ все статьи считаются unrated
→ ratingScore = null
```

Не подставлять искусственный fallback вроде:

``` text
C = undefined
C = rating.scale.max
```

Если существует хотя бы одна реальная оценка сайта:

``` text
siteRatingCount > 0
→ C вычисляется из реальных агрегатов
```

и rated articles получают Bayesian score.

Публичный `ratingValue` от этой формулы не меняется.

## 75.14. Статьи без оценок в rating sort

Статья с:

``` text
rating_count = 0
```

не получает искусственную публичную оценку.

При:

``` text
sort=rating
```

сначала идут статьи с реальными оценками, отсортированные по
`ratingScore`.

После них могут идти статьи без оценок.

Базовый порядок unrated:

``` text
publishDate DESC,
article_id ASC
```

Концептуально:

``` text
rated articles
↓
unrated articles
```

Это правило не должно приводить к исчезновению новых статей из
collection.

## 75.15. Tie-breakers рейтинговой сортировки

Базовый порядок:

``` text
rated first,
ratingScore DESC,
rating_count DESC,
publishDate DESC,
article_id ASC
```

Для unrated:

``` text
publishDate DESC,
article_id ASC
```

Порядок должен быть детерминированным.

## 75.16. Stats / ranking snapshot

Рейтинг входит в единый cached stats/ranking snapshot.

Публичная article stats часть использует authoritative
`PublicArticleStatsDTO` раздела 94:

``` json
{
  "id": "01K...",
  "reads": 3821,
  "commentsCount": 27,
  "ratingValue": 4.63,
  "ratingCount": 128
}
```

`ratingScore` остаётся внутренним Worker ranking signal:

``` text
может использоваться при построении ranking snapshot
не отображается пользователю
не входит в BlogPosting
не передаётся как публичный article stat
```

Для dynamic sorting Worker публикует уже упорядоченные article IDs
согласно разделу 114. Не делать отдельный GET rating для каждой карточки.

## 75.17. Eventual consistency

Статический Astro HTML не rebuild-ится после каждого голоса.

Допустимая схема:

``` text
D1
↓
Worker
↓
cached stats/ranking snapshot
↓
Astro / frontend
```

После POST rating пользователь получает свежий агрегат непосредственно в
mutation response.

Остальные пользователи и collection rankings могут увидеть изменение
после обновления cached snapshot.

Это нормальная eventual consistency.

## 75.18. Rating в подробной metadata `ⓘ`

Рейтинг является обязательной частью расширенной article metadata, если:

``` text
rating_count > 0
```

Пример:

``` text
Ocena
4.6 / 5 · 128 ocen
```

Если:

``` text
rating_count = 0
```

metadata может показывать:

``` text
Brak ocen
```

или не выводить числовой rating row --- определяется THEME.

Сам control голосования не обязан находиться внутри `ⓘ`; он может
находиться в основном article footer/content area.

## 75.19. Rating на карточках

THEME может показывать компактно:

``` text
★ 4.6 (128)
```

Но карточка не обязана содержать интерактивный rating control.

Рекомендовано:

``` text
article page
→ интерактивный rating;

cards/listings
→ read-only aggregate.
```

Это уменьшает случайные голоса и упрощает UX.

## 75.20. Structured data / Schema.org

Если:

``` text
rating_count > 0
```

`BlogPosting` JSON-LD получает:

``` json
{
  "@type": "BlogPosting",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.6,
    "ratingCount": 128,
    "bestRating": 5,
    "worstRating": 1
  }
}
```

Требования:

-   structured data использует те же реальные агрегаты, что публичный UI
    snapshot;
-   нельзя размечать выдуманный или скрытый рейтинг;
-   `bestRating = 5`;
-   `worstRating = 1`;
-   при `rating_count = 0` блок `aggregateRating` не выводится;
-   rating markup находится внутри сущности конкретного `BlogPosting`.

## 75.21. Google rich results --- ограничение

Schema.org semantic contract и Google rich result eligibility не
являются одним и тем же.

Starter должен считать:

``` text
BlogPosting.aggregateRating
→ допустимая semantic structured data
```

но НЕ обещать:

``` text
обычная статья гарантированно получит звёзды Google Review Snippet
```

На момент проектирования generic `Article/BlogPosting` не следует
считать гарантированно eligible типом для review-star rich result.

Поэтому документация проекта формулирует это как:

``` text
structured data для понимания сущности и рейтинга
```

а не:

``` text
гарантированные звёзды в SERP
```

Если правила Google изменятся, eligibility может быть пересмотрена без
изменения основной модели рейтинга.

## 75.22. Structured data и SSG freshness

Так как article HTML статический:

``` text
build-time stats snapshot
→ visible initial rating
→ JSON-LD aggregateRating
```

После новых голосов D1 может быть свежее HTML.

Не вводить SSR или rebuild после каждого vote только ради structured
data.

Правило:

``` text
JSON-LD отражает последний опубликованный build snapshot;
live RatingIsland может показывать более свежий агрегат;
следующий build обновляет JSON-LD.
```

При первом голосе статьи:

``` text
live UI
→ rating уже виден;

JSON-LD
→ появится после следующего build, когда snapshot содержит rating_count > 0.
```

Это допустимая eventual consistency для SSG architecture.

## 75.23. SEO integrity

Нельзя:

-   генерировать fake rating только ради schema;
-   показывать пользователю одно значение, а в build snapshot намеренно
    размечать другое;
-   добавлять `aggregateRating` при нуле реальных оценок;
-   использовать `ratingScore` как `ratingValue` в JSON-LD;
-   скрывать негативные реальные оценки из aggregate только ради SERP.

`ratingScore` является внутренним ranking signal и не относится к
Schema.org `ratingValue`.

## 75.24. Configuration

PROJECT config должен позволять минимум:

``` text
rating.enabled = true/false
rating.scale.min = 1
rating.scale.max = 5
rating.sorting.priorWeight = 10  # must be > 0
```

Для текущего starter/v1:

``` text
enabled = true
min = 1
max = 5
priorWeight = 10
```

Если feature отключён для отдельного clone:

-   rating UI отсутствует;
-   rating mutation endpoint не используется;
-   rating sort не предлагается;
-   aggregateRating не генерируется.

Но для текущего согласованного scope рейтинга v1 feature считается
обязательной.

## 75.25. Build validation

Build/check должен ловить:

-   `rating_count < 0`;
-   `rating_sum < 0`;
-   невозможный aggregate;
-   `rating_count = 0` при ненулевом публичном `ratingValue`;
-   `ratingValue < 1` или `ratingValue > 5` при наличии голосов;
-   malformed rating snapshot;
-   `rating.sorting.priorWeight <= 0`;
-   неизвестный article ID в rating snapshot;
-   duplicate article rating record в build snapshot.

Ошибки runtime/D1 не должны ломать статический build, если snapshot
временно недоступен: используется последний валидный snapshot или
documented fallback без fake rating.

## 75.26. Definition of Done для рейтинга

Rating feature считается реализованной только если:

-   читатель может поставить 1--5 звёзд;
-   UI доступен keyboard/screen reader;
-   рейтинг показывается с первой реальной оценки;
-   публично видны реальные `ratingValue` и `ratingCount`;
-   повторный голос заменяет предыдущий;
-   anonymous visitor identity не использует fingerprinting;
-   D1 имеет агрегаты и отдельные vote rows;
-   duplicate active vote ограничен
    `UNIQUE(site_id, article_id, visitor_id)`;
-   POST rating возвращает свежий aggregate;
-   POST защищён route-specific rate limit;
-   Turnstile не требуется для обычного rating action;
-   `ratingScore` отделён от публичного `ratingValue`;
-   сортировка использует Bayesian weighted score;
-   `m/priorWeight` configurable, default 10;
-   unrated статьи идут после rated в rating sort;
-   рейтинг входит в batch stats/ranking snapshot;
-   metadata `ⓘ` умеет показывать rating;
-   cards могут показывать read-only aggregate;
-   `BlogPosting.aggregateRating` генерируется при `rating_count > 0`;
-   structured data использует публичный aggregate, а не sorting score;
-   документация не обещает гарантированные Google review stars для
    BlogPosting;
-   SSG не rebuild-ится после каждого голоса;
-   dynamic rating failure не ломает статическую статью.

<a id="section-76"></a>
# 76. Contract-first policy для разработки и Codex

Спецификация является не списком пожеланий, а архитектурным контрактом
starter.

## 76.1. Приоритет контракта

Если решение явно зафиксировано в SPEC, реализация не имеет права
самостоятельно заменять:

-   архитектуру;
-   библиотеку или storage;
-   URL-схему;
-   API-модель;
-   data model;
-   SEO-поведение;
-   UX-поведение;
-   lifecycle;
-   security model;
-   caching semantics;
-   i18n contract.

Если деталь не определена, выбирается наиболее простая реализация,
совместимая со всеми существующими контрактами.

Изменение контракта требует явного изменения SPEC, а не скрытой
архитектурной импровизации в коде.

## 76.2. Уровни требований

Каждый крупный feature по возможности описывается четырьмя уровнями:

``` text
CONTRACT
→ обязательное внешнее и системное поведение

DEFAULT IMPLEMENTATION
→ рекомендуемая реализация starter

PROJECT CONFIG
→ разрешённые изменения между клонами

FORBIDDEN
→ решения, нарушающие архитектурный вектор
```

Не превращать случайный implementation detail в глобальный CONTRACT без
причины.

## 76.3. Стандарт feature contract

Для критических feature boundaries использовать, где применимо:

``` text
Purpose
Inputs
Outputs
Data model
Public API
Build-time behavior
Runtime behavior
Failure behavior
SEO behavior
Accessibility
i18n
Security
Caching
Configuration
Forbidden behavior
Definition of Done
```

Не каждый feature обязан искусственно иметь все пункты, но пропуск
важного поведения должен быть осознанным.

## 76.4. Failure-first rule

Каждый dynamic feature обязан определить degraded behavior.

Базовый принцип:

``` text
dynamic feature failed
≠
static page failed
```

Ошибка comments/rating/stats/search/lead integration не должна разрушать
статический контент, навигацию, canonical, structured content или
основной SEO HTML, если функция не является самой целью страницы.

## 76.5. Минимальная реализация

При двух реализациях, одинаково выполняющих CONTRACT, предпочтительна:

``` text
меньше runtime dependencies
меньше JavaScript
меньше API requests
меньше D1 writes
меньше background infrastructure
меньше project-specific coupling
```

Не добавлять очередь, отдельную БД, React island, Worker endpoint или
стороннюю библиотеку, если контракт полностью выполняется без них.

## Scope freeze после hardening

После утверждения разделов 89--93 starter считается архитектурно
зафиксированным для первой реализации.

До появления реального implementation edge case запрещено добавлять
новые infrastructure layers, frameworks или generalized abstractions «на
будущее».

Приоритет:

``` text
реализовать текущие contracts
→ измерить
→ исправить реальную проблему
```

а не:

``` text
предугадывать возможную будущую архитектуру
```

<a id="section-77"></a>
# 77. Контракт поиска

## 77.1. Scope

Поиск является reusable feature, но не должен автоматически превращаться
в серверную search-platform.

CONTRACT:

-   поиск только по допустимому опубликованному контенту;
-   locale-aware;
-   draft/scheduled исключаются;
-   content, запрещённый для search index правилами PROJECT,
    исключается;
-   результат имеет стабильные `id`, `title`, `url`, `type` и optional
    snippet;
-   поиск не создаёт индексируемые search-result URL по умолчанию.

## 77.2. Default implementation v1

Default:

``` text
build-time static search index
→ Pagefind или эквивалентный static-search engine
```

Выбор конкретного static engine может быть зафиксирован implementation
phase, но starter не должен одновременно поддерживать два search backend
без необходимости.

Не использовать произвольный размер вроде `500 KB` как автоматический
архитектурный переключатель.

## 77.3. Optional server search

Worker + D1 FTS допускается только как отдельный optional adapter, если
масштаб проекта действительно требует server-side search.

Он не является обязательным v1 dependency.

## 77.4. Locale

Язык поиска берётся из:

``` text
PROJECT i18n configured locales
```

Нельзя хардкодить:

``` text
pl | ru | en
```

или любой другой фиксированный набор языков в CORE.

## 77.5. Query safety

Нельзя считать удаление SQL/FTS спецсимволов основным security
mechanism.

Использовать:

-   validation;
-   length limits;
-   prepared SQL там, где есть SQL;
-   безопасное формирование FTS query;
-   escaping по правилам выбранного engine.

Поисковый запрос не должен бессмысленно ломаться для строк вроде `C++`,
`A/B` и похожих значимых символов.

## 77.6. Progressive enhancement

Если search UI требует JS, отсутствие JS не должно ломать остальную
страницу.

Search может быть недоступен без JS, если это явно documented optional
enhancement; нельзя ради него делать весь Header/navigation client-only.

## 77.7. Forbidden

-   N запросов по одной статье для построения search results;
-   индексация draft/scheduled;
-   hardcoded locale enum;
-   обязательный D1 только ради небольшого статического блога;
-   два параллельных search engine без подтверждённой причины.

Если PROJECT/implementation phase окончательно выбирает Pagefind,
indexing step обязан выполняться автоматически после `astro build` в
production pipeline. Пока engine не зафиксирован, SPEC не хардкодит
конкретную CLI-команду.

<a id="section-78"></a>
# 78. Hydration и progressive enhancement

## 78.1. Общий принцип

Astro HTML является default.

React island используется только для genuine interactivity.

## 78.2. Default hydration policy

Ориентир:

``` text
critical immediately-interactive above-fold
→ client:load или эквивалентная ранняя стратегия

low-priority interactive
→ client:idle

below-fold interactive
→ client:visible
```

Конкретная директива выбирается по реальному положению и UX feature, а
не только по имени компонента.

## 78.3. client:only

`client:only` запрещён по умолчанию.

Допускается только как documented exception, если feature действительно
не может иметь полезный server-rendered shell.

Использование должно объяснять:

-   почему SSR shell невозможен/бесполезен;
-   почему нет SEO/CLS/accessibility regression;
-   почему другая hydration strategy не подходит.

## 78.4. Native HTML first

Не создавать React island, если нативный HTML/CSS полностью выполняет
контракт.

Примеры:

``` text
обычный FAQ accordion
→ <details>/<summary>

простое disclosure
→ native details/popover where appropriate

простая ссылка/кнопка
→ HTML, не React
```

## 78.5. Forms

Формы должны иметь server-rendered HTML.

Где практично, использовать progressive enhancement:

``` text
валидный <form>
→ JS улучшает submit UX
→ core semantics не зависят от React render
```

Конкретный no-JS POST fallback обязателен только для feature, где
PROJECT требует работу формы без JS.

<a id="section-79"></a>
# 79. TOC contract

## 79.1. Build-time structure

TOC строится из MDX heading structure build-time.

Default levels:

``` text
H2
H3
```

H4+ в TOC по умолчанию не включаются.

PROJECT/THEME может изменить depth через config.

## 79.2. Heading IDs

Heading ID generator обязан:

-   быть детерминированным;
-   корректно работать с Unicode;
-   обрабатывать диакритику;
-   разрешать duplicate headings без duplicate IDs;
-   уважать поддерживаемый explicit heading ID, если такой синтаксис
    разрешён content pipeline;
-   использовать тот же ID для TOC link и heading.

## 79.3. TOC threshold

Threshold является PROJECT/THEME config, а не глобальным законом.

Разумный default:

``` text
показывать TOC при достаточном числе meaningful headings
```

Для tragarze default может быть `>= 3 H2`, но CORE не должен хардкодить
это как единственно допустимое значение.

## 79.4. Scrollspy

Если THEME использует scrollspy:

-   предпочтительно IntersectionObserver;
-   не использовать тяжёлый постоянный scroll handler без необходимости;
-   active-heading calculation учитывает реальную высоту sticky header;
-   offset/rootMargin является theme/config value, а не magic global
    constant;
-   отсутствие JS не ломает TOC links.

## 79.5. Anchor behavior

Headings имеют `scroll-margin-*`, согласованный со sticky header.

TOC anchors остаются обычными working links даже без scrollspy JS.

<a id="section-80"></a>
# 80. Structured Data contract

## 80.1. Единая система генерации

Structured data генерируется централизованным schema layer.

Концептуально:

``` text
StructuredData.astro
+
typed schema helpers
```

Например:

``` text
generateArticleSchema()
generatePersonSchema()
generateBreadcrumbSchema()
generateServiceSchema()
```

Конкретные имена файлов/functions могут отличаться.

## 80.2. Forbidden

Запрещено:

-   писать произвольный JSON-LD непосредственно внутри MDX как обычный
    editorial workflow;
-   дублировать одну сущность несколькими несогласованными generators;
-   вручную копировать rating/person/canonical data, если она уже
    существует в source model;
-   размечать данные, которых нет в реальном контенте/публичном UI там,
    где видимость требуется правилами типа.

## 80.3. Article

Blog content:

``` text
BlogPosting
```

использует данные из article/frontmatter/project/person/stats contracts.

Rating:

``` text
aggregateRating
→ только ratingCount > 0
→ публичный ratingValue
→ никогда не ratingScore
```

Применяются все ограничения раздела рейтинга.

## 80.4. Breadcrumbs и Person

Breadcrumb JSON-LD генерируется из той же route/breadcrumb model, что
видимый breadcrumb.

Person URLs используют канонические `/redakcja/{person-slug}/`.

Нельзя создавать отдельную скрытую SEO-модель, расходящуюся с видимой
архитектурой сайта.

## 80.5. FAQ

FAQ structured data не добавляется автоматически только потому, что на
странице визуально есть accordion.

Генератор должен включать FAQ schema только если content/type и
актуальные требования поисковых систем действительно оправдывают её
использование.

## 80.6. Validation

Build/check проверяет минимум:

-   валидную сериализацию JSON-LD;
-   absolute canonical/entity URLs where required;
-   отсутствие impossible rating;
-   существование referenced Person/article entities;
-   согласованность visible/source data и generated schema;
-   отсутствие duplicate/conflicting primary entities.

## 80.7. JSON-LD date serialization

`datePublished` и `dateModified` для editorial entities сериализуются
детерминированно из валидированных content fields:

``` text
publishDate
updatedDate
```

Формат:

``` text
ISO 8601 datetime
+
explicit timezone offset
```

Допустимо:

``` text
2026-09-10T14:00:00+02:00
2026-09-10T12:00:00.000Z
```

Не требуется искусственно переводить все editorial dates в UTC, если
PROJECT timezone/исходная дата содержит корректный explicit offset.

D1 runtime timestamps (`*_at_ms`) и editorial
`publishDate`/`updatedDate` --- разные data domains. JSON-LD Article
dates не должны случайно браться из runtime D1 timestamps
comments/rating.

Visible publication/update date и JSON-LD должны описывать одну и ту же
editorial дату.

<a id="section-81"></a>
# 81. Leads/forms contract

## 81.1. Разделение FEATURE и PROJECT

Reusable feature отвечает за:

``` text
form identity
page context
locale
validated fields
anti-spam
submission
storage/adapters
success/error contract
```

PROJECT определяет:

``` text
конкретные поля
тексты
Telegram/CRM/email integration
business promises
routing recipients
```

Нельзя хардкодить `calculator_bottom`, Telegram, конкретный CRM или
обещание вроде `ответим за 15 минут` в CORE.

## 81.2. Mutation

Если lead feature включён:

``` text
POST lead endpoint
```

обязан иметь:

-   schema validation;
-   Turnstile server verification;
-   honeypot;
-   route-specific rate limit;
-   duplicate-submit protection/idempotency strategy;
-   no-store response;
-   clear success/error response.

## 81.3. Honeypot

Default:

``` text
honeypot filled
→ fake success
→ DROP
```

Не сохранять заведомый honeypot spam в D1 без отдельной причины.

PROJECT может включить spam telemetry отдельно.

## 81.4. Integrations

External delivery выполняется adapter layer.

Примеры:

``` text
Telegram
email
CRM
Queue
webhook
```

Ни один из них не является обязательным dependency starter.

Успешная запись lead и external notification должны иметь явно
определённую failure policy; нельзя молча терять lead из-за сбоя
Telegram/CRM.

## 81.5. Same-origin vs API subdomain

API origin configurable.

Поддерживаемые deployment modes:

``` text
A:
api.example.com
→ Worker

B:
example.com/api/*
→ Worker route
```

Mode B используется только если deployment/DNS действительно позволяет
route Worker на основном hostname.

Default production mode starter:

``` text
A: api.example.com
```

Mode B остаётся поддерживаемой deployment alternative.

Точный cookie/fetch/CORS contract для обоих режимов определён в разделе
115.

CORE не предполагает, что все static/shared hosts находятся за
Cloudflare proxy.

## 81.6. CORS

Для cross-origin API:

``` text
site origin
→ api subdomain
```

Worker использует explicit allowlist разрешённых PROJECT origins.

Exact credentials/CORS behavior для API subdomain определён разделом 115.
Production wildcard CORS для credentialed или mutation API запрещён.

<a id="section-82"></a>
# 82. Cache contract

## 82.1. Семантика важнее конкретного TTL

CORE фиксирует cache semantics, а не универсальные CDN TTL для любого
hosting provider.

## 82.2. Static assets

Fingerprint/hash assets:

``` text
/_astro/*
```

могут получать long-lived immutable caching, если deployment
adapter/host это поддерживает.

## 82.3. Mutation API

Mutation responses:

``` text
comments POST
rating POST
helpful POST
report POST
lead POST
admin mutations
```

Default:

``` text
Cache-Control: no-store
```

## 82.4. Public snapshots

Stats/ranking snapshots являются cacheable.

Для текущей архитектуры ориентир:

``` text
~1 hour freshness
```

Точный TTL конфигурируется deployment/project layer.

## 82.5. Comments GET

Public comments GET может иметь короткий cache только если это не ломает
ожидаемую видимость свежего комментария.

После auto-publish mutation response уже содержит готовый comment,
поэтому frontend не обязан немедленно делать второй GET.

## 82.6. Admin/private

Admin API и персонализированные responses, включая
`GET /v1/articles/{articleId}/rating`:

``` text
private/no-store
```

если иной режим явно не доказан безопасным.

## 82.7. HTML

Не навязывать всему starter универсальный:

``` text
s-maxage
stale-while-revalidate
```

поскольку основной HTML может обслуживаться ordinary shared/static
hosting.

Конкретные HTML cache headers принадлежат deploy adapter.

<a id="section-83"></a>
# 83. API conventions

Логический namespace `/v1/` является authoritative для route contracts.
Deployment может публиковать его как `https://api.example.com/v1/...`
или `https://example.com/api/v1/...`; это не создаёт два разных API.

## 83.1. Versioning

Публичный dynamic API использует единый namespace:

``` text
/v1/...
```

Если deployment использует `/api` prefix, итоговый внешний URL может
быть:

``` text
/api/v1/...
```

На `api.example.com` допустим:

``` text
https://api.example.com/v1/...
```

Логический route contract остаётся `/v1/...`.

## 83.2. IDs

Backend references используют stable IDs, не mutable slug, если сущность
имеет stable ID.

Пример:

``` text
article_id
person_id
comment_id
```

## 83.3. Errors

API возвращает:

-   подходящий HTTP status;
-   machine-readable error code;
-   безопасное локализуемое/маппируемое сообщение или field errors;
-   без stack trace/internal SQL details.

## 83.4. Validation

Client validation является UX.

Worker validation является authority.

Нельзя считать HTML maxlength, disabled control или TypeScript type
достаточной backend validation.

## 83.5. Mutation caching

Все mutation endpoints:

``` text
no-store
```

если отдельный контракт явно не определяет иначе.

## 83.6. Unknown fields

Public и admin mutation JSON используют strict runtime schema:

``` text
unknown body field
→ reject 400/422
```

Молча игнорировать неизвестные mutation fields запрещено.

Для GET query parameters применяется explicit allowlist. Неизвестный query
parameter либо отклоняется как 400, либо удаляется/нормализуется только там,
где конкретный route contract прямо задаёт такое поведение (например
невалидный `sort` согласно разделу 74.16).

Это поведение является единым API contract и не выбирается handler'ом
произвольно.

## 83.7. DTO authority

Request/response DTO и runtime validation следуют Shared Runtime/API
Contracts раздела 94. API handler не должен иметь вторую вручную
расходящуюся копию тех же типов.

## 83.8. Security authority

Authentication boundary, mutation Origin/CORS policy, runtime input
validation, URL scheme rules, secret handling and public error redaction
следуют authoritative Security Contract раздела 95.

<a id="section-84"></a>
# 84. Deploy adapter contract

## 84.1. Цель

CORE не должен зависеть от одного static hosting provider.

Deploy adapter переводит нейтральные build artifacts/contracts в правила
конкретного hosting.

## 84.2. Adapter responsibilities

Где применимо:

-   real HTTP 301 redirects;
-   optional 410 rules;
-   custom 404 with real 404 status;
-   cache headers;
-   security headers;
-   Worker API routing;
-   same-origin `/api/*` route if selected;
-   static asset caching;
-   production verification commands.

## 84.3. Required verification

Deployment считается корректным только после проверки реального HTTP
behavior, а не только локального Astro preview.

Минимум:

``` text
old redirect URL
→ real 301 + correct Location

unknown URL
→ real 404 + project 404 page

canonical page
→ 200

API mutation
→ no-store

static hashed asset
→ expected cache policy where supported
```

## 84.4. Shared hosting

Для Apache-compatible shared hosting adapter может
генерировать/документировать `.htaccess`.

Для другого provider используются его native rules.

Нельзя выдавать Cloudflare Pages `_redirects` за универсальный формат
starter.

Security headers/CSP/HSTS implementation deploy adapter должен выполнять
согласно разделу 95, а не через provider-specific permissive defaults.

<a id="section-85"></a>
# 85. Канонический D1 Data Model

Этот раздел является authoritative для физической D1 schema. При
конфликте с более ранними концептуальными примерами схем или названиями
runtime timestamp-полей применяется этот раздел; такие ранние примеры
должны быть приведены к нему при реализации.

Физические D1 tables определяются централизованно в этом разделе.

Feature-разделы Reads / Comments / Rating описывают бизнес-логику и
state transitions, но не создают собственные несовместимые версии одной
и той же таблицы.

## 85.1. Runtime timestamps

Все runtime timestamps в D1 хранятся как:

``` text
Unix epoch milliseconds UTC
INTEGER
```

Имена:

``` text
created_at_ms
updated_at_ms
```

где применимо.

Не смешивать в одной runtime table ISO TEXT с разной точностью
миллисекунд.

Editorial/content dates остаются отдельным contract:

``` text
publishDate
updatedDate
→ ISO-compatible
→ PROJECT timezone semantics
```

## 85.2. `content_articles`

Worker не может считать произвольный присланный `article_id`
существующей публикацией только потому, что формат ID валиден.

Канонический runtime registry:

``` sql
CREATE TABLE content_articles (
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  publish_at_ms INTEGER NOT NULL,
  runtime_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at_ms INTEGER NOT NULL,

  PRIMARY KEY (site_id, article_id),

  CHECK (runtime_enabled IN (0, 1))
);
```

Registry синхронизируется из validated Astro content model deployment
pipeline согласно разделу 112.

В registry попадают production-public lifecycle entries:

``` text
published
noindex but publicly reachable
```

Не попадают как runtime-enabled:

``` text
draft
future/scheduled
removed
```

`publish_at_ms` --- нормализованный build-time instant из validated
`publishDate` с PROJECT timezone semantics. Он хранится только для
детерминированных runtime ranking tie-breakers и не заменяет editorial
date source в MDX.

Slug/route не является runtime identity и не требуется Worker для
comments/rating/reads.

Worker перед любой article-scoped mutation проверяет:

``` text
site_id + article_id exists
AND runtime_enabled = 1
```

`content_articles` является runtime allowlist, но не дублирует article
body, title, card copy или SEO metadata в D1.

## 85.3. `article_stats`



Каноническая таблица:

``` sql
CREATE TABLE article_stats (
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,

  reads INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,

  rating_sum INTEGER NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,

  updated_at_ms INTEGER NOT NULL,

  PRIMARY KEY (site_id, article_id),

  CHECK (reads >= 0),
  CHECK (comments_count >= 0),
  CHECK (rating_sum >= 0),
  CHECK (rating_count >= 0)
);
```

`article_id` --- стабильный article ID, не slug.

`comments_count` означает:

``` text
количество comments
WHERE status = 'published'
```

### 85.4. `article_read_daily`

`Popularne teraz` требует временного агрегата, но не raw analytics event
history.

Каноническая таблица:

``` sql
CREATE TABLE article_read_daily (
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  day_utc TEXT NOT NULL,
  reads INTEGER NOT NULL DEFAULT 0,
  updated_at_ms INTEGER NOT NULL,

  PRIMARY KEY (site_id, article_id, day_utc),

  CHECK (reads >= 0),
  CHECK (length(day_utc) = 10)
);
```

`day_utc` имеет нормализованный формат `YYYY-MM-DD` в UTC и является
bucket key, а не пользовательским timestamp.

При accepted qualified read Worker атомарно where supported:

``` text
article_stats.reads += 1
article_read_daily[current UTC day].reads += 1
```

Таблица хранит только агрегат `site/article/day`; visitor_id, IP,
fingerprint, URL history и raw read events в неё не попадают.

Default:

``` text
popularityWindowDays = 7
```

Значение принадлежит PROJECT config и MUST быть положительным integer.
Для low-traffic проекта допустимо, например, 30.

`popularNow`:

``` text
SUM(article_read_daily.reads)
за последние popularityWindowDays UTC calendar-day buckets, включая текущий UTC day.
Это rolling calendar window, а не точное скользящее окно последних N×24 часов
```

Старые buckets могут удаляться retention job после достаточного запаса
для максимального поддерживаемого окна и operational recovery. Retention
не должна ломать configured ranking window.

## 85.5. `comments_count` state transitions

`article_stats.comments_count` означает количество только `published`
comments.

Агрегат изменяется только при изменении числа публичных comments.

``` text
new published
→ +1

new pending
→ 0

new spam
→ 0

pending → published
→ +1

spam → published
→ +1

published → pending
→ -1

published → spam
→ -1

DELETE published
→ -1

DELETE pending/spam
→ 0

report
→ 0

helpful
→ 0

link_rel change
→ 0
```

Comment mutation и соответствующий `article_stats.comments_count` update
должны выполняться атомарно в рамках поддерживаемого D1/Worker pattern.

Нельзя вручную корректировать `comments_count` через публичный API.

## 85.6. `comments`

Каноническая физическая таблица:

``` sql
CREATE TABLE comments (
  id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,

  parent_id TEXT,

  author_name TEXT NOT NULL,
  body TEXT NOT NULL,

  status TEXT NOT NULL,
  moderation_reason TEXT,

  reports_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,

  link_rel TEXT,

  created_at_ms INTEGER NOT NULL,

  PRIMARY KEY (id),

  CHECK (length(author_name) BETWEEN 1 AND 40),
  CHECK (length(body) BETWEEN 1 AND 1500),
  CHECK (status IN ('published', 'pending', 'spam')),
  CHECK (
    link_rel IS NULL
    OR link_rel IN ('dofollow', 'nofollow', 'sponsored')
  ),
  CHECK (reports_count >= 0),
  CHECK (helpful_count >= 0)
);
```

`site_id + article_id` определяют article scope. `article_id` --- stable
article ID, не slug.

`parent_id` nullable. Application contract нормализует reply-to-reply к
root comment согласно разделу comments; база не вводит произвольную
бесконечную визуальную вложенность.

Foreign key на `article_stats` не обязателен. Worker валидирует
`site_id/article_id` через canonical `content_articles` registry до
article-scoped mutation. `article_stats` остаётся runtime aggregate table.

Минимальные индексы:

``` sql
CREATE INDEX idx_comments_public_keyset
ON comments (
  site_id,
  article_id,
  status,
  created_at_ms DESC,
  id DESC
);

CREATE INDEX idx_comments_featured
ON comments (
  site_id,
  article_id,
  status,
  helpful_count DESC,
  created_at_ms DESC
);

CREATE INDEX idx_comments_moderation
ON comments (
  status,
  reports_count,
  created_at_ms DESC
);
```

Индексы являются canonical starter defaults. Реальная production
telemetry может обосновать изменение индекса, но Codex не должен
добавлять дополнительные индексы «на всякий случай».

`comments_count` в `article_stats` меняется атомарно с mutation, которая
меняет количество `published` comments.

Runtime timestamp:

``` text
created_at_ms INTEGER
→ Unix epoch milliseconds UTC
```

## 85.7. `article_rating_votes`

Каноническая таблица концептуально:

``` sql
CREATE TABLE article_rating_votes (
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,

  value INTEGER NOT NULL,

  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,

  PRIMARY KEY (site_id, article_id, visitor_id),

  CHECK (value >= 1 AND value <= 5)
);
```

Эквивалентный `UNIQUE(site_id, article_id, visitor_id)` допустим, если
используется отдельный technical primary key.

## 85.8. Aggregate ownership

Ownership:

``` text
Reads
→ меняет article_stats.reads
→ меняет article_read_daily current-day aggregate

Comments
→ меняет article_stats.comments_count

Rating
→ меняет article_stats.rating_sum/rating_count
```

Feature не должен модифицировать чужой aggregate без явно описанного
contract.

## 85.9. Aggregate repair

Админский/maintenance repair tool может пересчитать aggregates из source
tables, если runtime drift когда-либо возник.

Это maintenance capability, а не обычный пользовательский request path.

Для `comments_count` source of truth:

``` text
COUNT(comments WHERE status='published')
```

Для rating:

``` text
COUNT(article_rating_votes)
SUM(article_rating_votes.value)
```

All-time reads и daily rolling buckets не имеют reconstructible raw-event
source table, поскольку проект сознательно не хранит подробную read
analytics history. Их recovery выполняется из backup/snapshot, а не из
visitor-level событий.

<a id="section-86"></a>
# 86. Contract-hardening Definition of Done

Перед началом массовой реализации Codex должен иметь однозначные ответы
минимум по следующим boundaries:

``` text
content lifecycle
routing
redirects
404/410
i18n
canonical/hreflang
structured data
images/social images
authors/editorial
reads
rating
content discovery / sorting / pagination
rolling popularity
comments
search
TOC
metadata/share
leads/forms if enabled
API conventions
canonical D1 data model
caching
hydration/performance
deploy adapter
```

Для каждого критического boundary должно быть понятно:

``` text
что обязательно;
что configurable;
что является default;
что запрещено;
как система деградирует при ошибке;
как проверяется Definition of Done.
```

Если SPEC оставляет два архитектурно несовместимых варианта без правила
выбора, contract-hardening считается незавершённым.

<a id="section-87"></a>
# 87. Руководство по поэтапной реализации и настройке сервисов

Этот раздел является operational implementation guide. Он задаёт
рекомендуемый порядок запуска starter и первого production project.

Принцип:

``` text
не строить все слои отдельно
→ собирать вертикальные working slices
→ после каждого этапа иметь проверяемый результат
```

## 87.1. Какие внешние сервисы нужны

Минимальный production-набор:

``` text
GitHub
→ repository / version history

Cloudflare Workers
→ dynamic API

Cloudflare D1
→ runtime data

Cloudflare Turnstile
→ anti-spam challenge для comments/leads

Cloudflare Zero Trust / Access
→ admin protection

обычный/static hosting
→ Astro dist
```

Cloudflare DNS для основного сайта полезен, но не является обязательным
условием самого Astro starter, если выбранная deployment architecture
работает с отдельным API hostname.

## 87.2. Этап 0 --- аккаунты и доступы

Создать/проверить:

1.  GitHub account.
2.  Cloudflare account.
3.  Доступ к DNS домена.
4.  Доступ к static/shared hosting.
5.  Локальную Node.js development environment.

Не сохранять пароли/API secrets внутри SPEC, README, Git или PROJECT
config.

## 87.3. Этап 1 --- repository

Создать private GitHub repository.

Рекомендуемая модель:

``` text
starter repository
→ template/source

project repository
→ конкретный сайт
```

Для первого проекта допустимо начать с одного repository, если это
ускоряет разработку, а template extraction сделать после стабилизации
CORE.

Минимальные branches:

``` text
main
dev
```

Но branch model является workflow default, а не CORE contract.

## 87.4. Этап 2 --- базовый Astro project

Сначала добиться локально:

``` text
npm install
npm run dev
npm run build
npm run preview
```

До подключения Worker должны работать:

-   routes;
-   article rendering;
-   MDX validation;
-   PROJECT config;
-   i18n;
-   canonical/hreflang;
-   sitemap/RSS;
-   404;
-   basic THEME;
-   images/fonts;
-   no-JS article reading.

Не начинать dynamic backend до успешного static production build.

## 87.5. Этап 3 --- Cloudflare Worker

Cloudflare Dashboard:

``` text
Workers & Pages
→ Create
→ Worker
```

PROJECT-friendly имя, например:

``` text
tragarze-api
```

На development stage использовать `workers.dev` URL.

Worker сначала реализует только diagnostic endpoint:

``` text
GET /health
→ 200
```

Цель этапа:

``` text
local Worker
→ deploy
→ production-like Worker response
```

Не создавать отдельные Workers для reads/comments/rating без отдельной
масштабной причины.

## 87.6. Этап 4 --- D1

Создать одну D1 database для проекта или согласованной группы сайтов:

``` text
Storage & databases
→ D1
→ Create database
```

Пример:

``` text
tragarze-db
```

Добавить Worker D1 binding:

``` text
binding name:
DB
```

В starter использовать стабильное имя binding:

``` text
env.DB
```

D1 schema включает canonical `content_articles` runtime registry раздела 85; Worker не принимает произвольный article ID без registry check.

## 87.7. Этап 5 --- migrations

Database schema не создаётся вручную как единственный источник истины.

Repository:

``` text
worker/
└ migrations/
   ├ 0001_initial.sql
   ├ 0002_indexes.sql
   └ ...
```

Authoritative schema берётся из раздела 85.

Migration workflow:

``` text
create migration
→ apply locally
→ run tests/check
→ apply production D1
→ deploy compatible Worker
```

Любое schema изменение обязано существовать в Git.

## 87.8. Этап 6 --- первый vertical slice: Rating

Rating рекомендуется реализовать первым dynamic feature, потому что он
проще comments и одновременно проверяет:

``` text
Astro island
→ API
→ visitor_id
→ Worker validation
→ D1 transaction/update
→ article_stats
→ response
```

Scenario:

``` text
user selects 1–5
→ POST /v1/articles/{articleId}/rating
→ insert/update vote
→ atomically update aggregate
→ return ratingValue/ratingCount/myRating
→ UI updates without second GET
```

После этого проверить:

-   reload сохраняет active user vote;
-   изменение vote корректно меняет sum/count;
-   повтор не создаёт вторую строку;
-   invalid value reject;
-   rate limit работает;
-   response `no-store`;
-   Worker failure не ломает article page.

## 87.9. Этап 7 --- Turnstile

Создать widget:

``` text
Cloudflare
→ Turnstile
→ Add widget
```

Для production project задать разрешённые hostname.

Получить:

``` text
site key
secret key
```

Правила:

``` text
site key
→ public config допустим

secret key
→ Worker secret only
```

Worker secret:

``` text
TURNSTILE_SECRET
```

Server-side Siteverify является обязательной частью comment/lead
acceptance.

## 87.10. Этап 8 --- второй vertical slice: Comments

Реализовать один полный сценарий обычного комментария:

``` text
SSR form/shell
→ CommentsIsland enhancement
→ Turnstile
→ POST /v1/comments
→ Worker
→ D1
→ published/pending response
→ UI
```

Server order:

``` text
rate limit
→ body/content-type limit
→ schema validation
→ honeypot
→ Turnstile
→ link/spam classification
→ D1 mutation
→ article_stats.comments_count if required
→ response
```

После basic create:

1.  GET pagination.
2.  featured exclusions.
3.  replies.
4.  helpful.
5.  report.
6.  moderation transitions.
7.  admin API.

Не реализовывать admin UI до корректной public comments state machine.

## 87.11. Этап 9 --- qualified reads

После comments/rating:

``` text
10 sec
OR
25% article reached
→ один POST
```

Проверить:

-   обычный page open не увеличивает read;
-   оба условия в одной page session не создают два POST;
-   refresh-spam имеет простой dedup;
-   нет heartbeat;
-   нет raw-IP identity;
-   нет fingerprinting.

## 87.12. Этап 10 --- stats snapshot

После working aggregates реализовать batch stats/ranking snapshot.

Цель:

``` text
listing/article metadata
→ один cacheable source
→ no N requests
```

Проверить:

-   stale snapshot не ломает страницу;
-   layout reserve предотвращает CLS;
-   live mutation UI может быть свежее build/static snapshot;
-   schema и visible static aggregate согласованы в пределах выбранного
    snapshot lifecycle.

Authoritative public snapshot обслуживается Worker через `GET /v1/stats` и содержит article stats + ordered ranking IDs согласно разделам 113–114.

## 87.13. Этап 11 --- API domain

После проверки `workers.dev` назначить production API hostname:

``` text
api.example.com
```

Frontend получает base URL из PROJECT/environment config.

Не hardcode domain внутри islands.

Если используется cross-origin:

``` text
https://example.com
→ https://api.example.com
```

настроить explicit CORS origin allowlist.

Same-origin:

``` text
/example.com/api/*
```

подключать только если deployment действительно использует
соответствующий Worker Route.

## 87.14. Этап 12 --- Cloudflare Access для admin

Только после working admin API:

``` text
Zero Trust
→ Access
→ Applications
→ Self-hosted
```

Защитить:

``` text
/admin/*
```

или admin hostname согласно deployment.

Policy:

``` text
Allow
→ явно разрешённые admin identities
```

Starter не создаёт собственные:

``` text
users
password hashes
login sessions
JWT auth
password reset
```

если отдельный PROJECT contract этого не требует.

## 87.15. Этап 13 --- search

Search реализовать после стабилизации content/routing.

Default:

``` text
static build-time search
```

Если окончательно выбран Pagefind:

``` text
astro build
→ Pagefind indexing dist
```

является частью автоматического production build pipeline.

Не оставлять search indexing как ручную операцию перед deploy.

D1 FTS не подключать, пока static search реально не перестал
удовлетворять требованиям.

## 87.16. Этап 14 --- deployment adapter

Настроить selected hosting:

-   upload/deploy `dist/`;
-   HTTP 301;
-   project 404 with real 404;
-   optional 410;
-   cache headers;
-   hashed assets;
-   API routing where applicable.

Production HTTP validation:

``` text
canonical page
→ 200

old URL
→ 301 + correct Location

unknown URL
→ 404 + project 404 body

hashed asset
→ expected long cache where supported

mutation API
→ no-store
```


Deployment adapter/pipeline также проверяет:

``` text
runtime content registry sync order
default api subdomain credentialed CORS
visitor cookie flags
production robots/noindex behavior
```

согласно разделам 112, 115 и 119.

## 87.17. Этап 15 --- Search Console и production SEO verification

После первого production deploy:

1.  Добавить/подтвердить property в Google Search Console.
2.  Проверить canonical representative URLs через URL Inspection.
3.  Отправить sitemap.
4.  Проверить robots/noindex.
5.  Проверить Rich Results Test для representative
    Article/Breadcrumb/Person pages.
6.  Проверить реальные redirect/404 status.
7.  Проверить mobile rendering.
8.  Не отправлять draft/scheduled/preview URLs.

Search Console verification является production QA, а не runtime
dependency starter.

## 87.18. Этап 16 --- performance/UX verification

Representative pages:

``` text
article with hero
article without hero
category listing
author profile
search
comments opened
404
```

Проверить:

-   mobile narrow viewport;
-   cold cache;
-   throttled connection;
-   keyboard;
-   touch;
-   text zoom;
-   JS disabled;
-   Worker unavailable;
-   Turnstile failure;
-   slow dynamic API.

Performance targets:

``` text
LCP ≤ 2.5 s
INP ≤ 200 ms
CLS ≤ 0.1
```

Field data имеет больший вес, чем стремление получить искусственный
Lighthouse 100.

## 87.19. Рекомендуемый порядок Codex implementation

Codex получает не весь проект как один неделимый этап, а
последовательные vertical slices:

``` text
1. repository skeleton
2. PROJECT/THEME/CORE boundaries
3. content collections + MDX lifecycle
4. routing + i18n + SEO shell
5. images/fonts/accessibility baseline
6. Worker + /health
7. D1 migrations
8. rating end-to-end
9. Turnstile
10. comments create/state machine
11. comments pagination/actions
12. qualified reads
13. stats/ranking snapshot
14. admin API
15. Access-protected admin UI
16. search
17. deploy adapter
18. production SEO/performance/UX verification
19. cleanup/documentation
```

После каждого этапа:

``` text
build
typecheck
tests/check
manual representative scenario
commit
```

Не начинать следующий большой layer, если предыдущий vertical slice не
имеет проверяемого working result.

## 87.20. Secrets/config checklist

Git/public repository никогда не содержит:

``` text
TURNSTILE_SECRET
Cloudflare API tokens
D1 credentials/tokens
Access secrets
external webhook secrets
```

Public/project config может содержать:

``` text
siteId
siteUrl
apiBaseUrl
enabled features
public Turnstile site key
locale/routes
non-secret feature configuration
```

Environment-specific secrets задаются deployment environment.

## 87.21. Минимальный infrastructure Done

Infrastructure ready, когда:

``` text
Astro static build работает отдельно
Worker /health работает
D1 migrations воспроизводимы из Git
rating vertical slice работает
Turnstile проверяется server-side
comments basic flow работает
API domain/CORS корректны
admin защищён Access
real 301/404 проверены
production secrets отсутствуют в Git
```

<a id="section-88"></a>
# 88. Финальный SEO / Performance / UX Gate перед production

Этот раздел не добавляет новые product features. Он является
обязательным release gate для representative templates.

## 88.1. SEO gate

Проверить:

``` text
200 page → self-consistent canonical
localized page → correct hreflang set
missing translation → no fake hreflang
draft/scheduled → отсутствует из public build
noindex → отсутствует из sitemap
redirect source → реальный 301 и не находится в sitemap
404 → real 404
page 2+ → собственный canonical базовой pagination
sort query → canonical к соответствующей unsorted pagination page
search UI → не создаёт автоматически indexable search-result pages
```

Indexable content page должна иметь:

-   один основной intent;
-   уникальный полезный main content;
-   понятный H1;
-   адекватный title/description без keyword stuffing;
-   crawlable internal links к meaningful related entities;
-   visible breadcrumb, если он предусмотрен template;
-   structured data, согласованное с видимым content.

Не создавать indexable combinations только потому, что технически можно
сгенерировать URL.

## 88.2. Structured data gate

Representative public templates проходят validation.

Проверять минимум:

``` text
BlogPosting
BreadcrumbList
Person/ProfilePage where applicable
Organization where applicable
```

`aggregateRating`:

``` text
только при rating_count > 0
→ visible real aggregate
→ ratingValue, не internal ratingScore
```

Не обещать Google star snippet для generic BlogPosting: schema semantics
и Google rich-result eligibility являются разными вещами.

## 88.3. Performance gate

Проверять на production-like build, а не только dev server.

Field target:

``` text
LCP ≤ 2.5 s
INP ≤ 200 ms
CLS ≤ 0.1
75th percentile
```

До появления достаточных field data использовать Lighthouse/DevTools как
диагностические ориентиры.

Обязательные проверки:

-   hero/LCP image не lazy;
-   width/height/aspect-ratio зарезервированы;
-   below-fold images lazy;
-   `srcset/sizes` соответствует layout;
-   нет неоправданного image preload;
-   только критические fonts preload;
-   нет глобального React app;
-   below-fold islands не грузятся как `client:load` без причины;
-   listings не делают N stats requests;
-   third-party scripts не подключаются по умолчанию;
-   динамический failure не блокирует first content render.

## 88.4. UX gate

На mobile baseline проверить:

``` text
320
360
375
390
430
```

Минимум:

-   нет horizontal page overflow;
-   tap targets порядка 44×44 CSS px;
-   sticky UI не закрывает focused controls/anchors;
-   статья читаема без JS;
-   основной текст не перекрывается banners/dialogs;
-   dialogs имеют close + Escape/platform dismiss + focus return;
-   ошибки forms понятны рядом с полем/формой;
-   submit не допускает случайных повторов;
-   loading state не прыгает по высоте;
-   Back/Forward восстанавливает sort/pagination state;
-   ToC anchors работают без scrollspy JS;
-   search/comments failure имеет спокойный degraded state, а не
    бесконечный spinner.

## 88.5. No-JS / degraded gate

Без JavaScript:

``` text
article
navigation
breadcrumbs
author links
canonical/SEO HTML
images
basic content hierarchy
```

остаются рабочими.

Dynamic-only features могут быть недоступны, но их shell не должен
маскировать основной content.

При Worker/API failure:

``` text
не удалять уже SSR-rendered content
не ломать layout
не зависать бесконечно
показывать понятный retry/temporary unavailable state where useful
```

## 88.6. Release decision

Production release блокируется при:

``` text
soft-404
broken canonical/hreflang
draft leak
broken redirect chain
avoidable major CLS
critical keyboard trap
main content requiring JS
secrets in public bundle/repo
N-request listing regression
invalid D1 migration state
```

Низкоприоритетные cosmetic Lighthouse warnings сами по себе не блокируют
release, если UX и реальные contracts выполнены.

<a id="section-89"></a>
# 89. Dependency Boundaries и ownership contract

Цель этого раздела --- исключить архитектурное «творчество» Codex между
слоями.

Authoritative dependency direction:

``` text
PROJECT
↓
THEME
↓
FEATURES
↓
CORE
```

Разрешено:

``` text
PROJECT → THEME
PROJECT → FEATURES
PROJECT → CORE

THEME → FEATURES
THEME → CORE

FEATURES → CORE

CORE → CORE
```

Запрещено:

``` text
CORE → FEATURES
CORE → THEME
CORE → PROJECT

FEATURES → THEME
FEATURES → PROJECT

THEME → PROJECT
```

## 89.1. Ownership

``` text
CORE
→ generic content/runtime contracts
→ validation primitives
→ shared utilities
→ provider-neutral interfaces
→ no project business copy
→ no concrete branding

FEATURES
→ reusable/headless feature logic
→ comments/rating/search/reads/leads adapters
→ semantic/accessibility UI primitives only where feature behavior requires them
→ no final project styling, spacing, colors or branding
→ no concrete project theme decisions

THEME
→ visual components
→ typography
→ spacing
→ component presentation
→ mobile/desktop responsive behavior
→ no database schema ownership
→ no business-specific data source assumptions

PROJECT
→ concrete routes
→ copy
→ categories
→ authors
→ locale map
→ feature toggles
→ external recipients/adapters
→ project-specific data
```

### 89.1.1. Theme composition boundary

THEME экспортирует provider/project-neutral typed configuration contract,
например:

``` ts
type ThemeConfig = {
  brand: {
    accent: string;
    accentDark?: string;
  };
  assets: {
    logo: string;
    logoDark?: string;
  };
};
```

Это illustrative shape, не обязательный exact DTO; конкретные поля
добавляются только когда THEME реально их использует.

PROJECT:

``` text
imports THEME public API
creates ThemeConfig value
passes it at root layout/composition point
```

THEME:

``` text
does not import @project/*
does not read project files by relative path
receives configuration through typed public boundary
```

Project-specific CSS values преобразуются в semantic THEME tokens в одном
composition point, а не читаются компонентами напрямую.

## 89.2. Import enforcement

Repository SHOULD enforce boundaries mechanically where practical.

Acceptable methods:

``` text
TypeScript path aliases
ESLint/import rules
folder-level barrel APIs
architecture check script
```

Codex must not bypass a layer boundary with deep relative imports.

Forbidden:

``` text
../../../../project/site.config
../../../theme/Button
```

from CORE/FEATURES when that import direction violates this section.

Preferred public imports:

``` text
@core/*
@features/*
@theme/*
@project/*
```

## 89.3. Environment matrix

Minimum environments:

``` text
development
preview
production
```

Expected behavior:

``` text
development
→ local Astro
→ local Worker/D1 where applicable
→ debug-friendly
→ no production indexing assumptions

preview
→ production-like build
→ preview API/data
→ no production data writes unless explicitly approved
→ noindex by deployment/project policy where required

production
→ real canonical URLs
→ real redirects
→ production D1
→ production secrets
→ public sitemap/indexing according to lifecycle
```

Preview must not accidentally use production D1 write credentials by
default.

## 89.4. Forbidden architecture drift

Codex must not introduce without explicit SPEC change:

``` text
new framework
global React app
client-side router for normal content navigation
ORM
auth framework
state-management framework
second database
new API version
queue
message bus
service worker
PWA layer
external search backend
analytics SDK
CSS framework
component library
```

Exception requires documented reason plus SPEC update.

------------------------------------------------------------------------

Visual ownership и CSS implementation дополнительно регулируются
authoritative Design System Contract разделов 96--107. Эти разделы не
меняют dependency direction: THEME не получает право импортировать
PROJECT напрямую.

<a id="section-90"></a>
# 90. URL Normalization и duplicate-control contract

Цель --- один public URL для одного indexable document.

## 90.1. Canonical origin

PROJECT defines exactly one canonical origin:

``` text
https://example.com
```

Production must normalize:

``` text
http → https

www/non-www
→ exactly one chosen canonical host
```

The non-canonical host/origin redirects with real HTTP redirect before
rendering content.

## 90.2. Path normalization

PROJECT chooses one trailing-slash policy globally:

``` text
always trailing slash
OR
never trailing slash
```

The chosen policy applies consistently to:

``` text
canonical
internal links
sitemap
hreflang
redirect destinations
breadcrumbs
pagination
author profiles
category pages
```

The alternate path form redirects to the canonical path.

Case policy:

``` text
generated routes/slugs
→ lowercase by default
```

Do not create two public documents differing only by path case.

## 90.3. Query normalization

Known UI query parameters:

``` text
sort
optional feature-specific non-indexing state
```

Rules:

-   canonical strips non-content state query parameters;
-   unknown tracking parameters do not change canonical;
-   internal links do not deliberately propagate tracking parameters;
-   query order must not create separate logical documents;
-   fragments never affect canonical.

Examples:

``` text
/blog/?sort=rating
→ canonical /blog/

/blog/page/2/?sort=popular
→ canonical /blog/page/2/
```

## 90.4. Pagination normalization

``` text
/blog/page/1/
→ redirect or normalize to /blog/
```

Same for category/author/collection listings.

Invalid page:

``` text
page <= 0
non-integer page
page beyond last meaningful page
```

must not become an indexable soft-duplicate.

Preferred behavior:

``` text
invalid/nonexistent pagination URL
→ real 404
```

Do not silently render page 1 with HTTP 200.

## 90.5. Internal-link canonicality

Build/check should detect links that target:

``` text
redirect sources
non-canonical trailing-slash form
/page/1/
wrong locale path
known obsolete slug
```

Internal links should resolve directly to final canonical URLs, not
through redirects.

## 90.6. Orphan detection

Published indexable article should normally be reachable from at least
one meaningful internal path:

``` text
category
listing
author profile
related/internal editorial link
```

Orphan check may be warning rather than fatal, but deliberate orphaning
must be explicit.

------------------------------------------------------------------------

<a id="section-91"></a>
# 91. Performance Budgets

CWV targets remain the user-facing outcome. This section constrains
implementation drift before field data exists.

Budgets are starter defaults, not universal truths. A PROJECT may
tighten or relax them explicitly.

## 91.1. JavaScript budgets

Normal article page, excluding browser extensions:

``` text
initial framework/application JS
→ target as close to 0 KB as practical

non-interactive article
→ 0 React hydration

individual small island
→ keep implementation intentionally small
```

Default guidance:

``` text
rating island
→ <= 15 KB compressed custom+framework share where practical

metadata/share enhancement
→ prefer native HTML; ideally no React

comments island initial code
→ <= 35 KB compressed where practical

search island
→ load only when search UI is used/visible
```

These are engineering budgets, not reasons to build custom fragile code
merely to save 1--2 KB.

Forbidden without documented justification:

``` text
global hydration bundle
duplicate React/runtime copies
large utility library for one helper
full date library for simple formatting
client-side markdown renderer
```

## 91.2. CSS budget

Default:

``` text
critical/global CSS
→ small, shared, cacheable

page-specific CSS
→ only where needed
```

Avoid shipping unused component-library CSS.

A concrete PROJECT may set a compressed global CSS target, but starter
should prefer architecture-level control over arbitrary hard byte
policing.

## 91.3. Fonts

Default public article page:

``` text
1 font family preferred
2 families allowed if design benefit is clear

only used weights/styles
WOFF2
subset where practical
```

Avoid:

``` text
variable font + duplicate static weights
multiple decorative families
preloading every weight
```

## 91.4. Third-party scripts

Default:

``` text
0 third-party marketing/analytics scripts
```

Any new third-party script requires:

-   project-level opt-in;
-   purpose;
-   loading strategy;
-   privacy consideration;
-   measured performance impact.

## 91.5. Request budget

Above-fold article render should not depend on dynamic API.

Initial article navigation must not require:

``` text
comments API
rating API
stats API
search API
```

for main content visibility.

Listings:

``` text
stats
→ one batch snapshot/request or static snapshot

forbidden
→ N requests for N cards
```

## 91.6. Performance regression gate

A change that materially worsens:

``` text
LCP
INP
CLS
initial JS
font count
third-party requests
```

requires justification in review.

Codex should not "fix" a regression by hiding useful content or removing
accessibility.

------------------------------------------------------------------------

<a id="section-92"></a>
# 92. Mobile Interaction Contract

Это общий interaction contract для всех THEME/FEATURE UI.

## 92.1. Viewport baseline

Required manual checks:

``` text
320
360
375
390
430 CSS px
```

iPhone 13 mini remains a practical baseline, but implementation must not
special-case one device.

## 92.2. Touch targets

Interactive controls should generally provide about:

``` text
44 × 44 CSS px
```

usable target size.

Small inline text links inside prose are an allowed semantic exception.

## 92.3. Safe areas

Fixed/sticky mobile UI that touches viewport edges should account for:

``` css
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

where applicable.

Do not add safe-area padding twice when browser/layout already provides
sufficient spacing.

## 92.4. Sticky elements

Sticky header/footer must not:

-   cover anchor targets;
-   cover focused form controls;
-   trap content behind keyboard;
-   consume excessive vertical space on small screens.

`scroll-margin-top` must align with effective sticky header height.

## 92.5. Dialog / bottom sheet states

Every modal-like surface defines:

``` text
open
close
Escape/platform dismiss
backdrop dismiss policy
focus entry
focus return
scroll lock behavior
```

Mobile bottom-sheet styling may use `<dialog>`, but interaction behavior
must remain accessible.

Swipe-to-dismiss is optional enhancement, never the only close
mechanism.

## 92.6. Keyboard behavior

Forms must remain usable when software keyboard is open.

Avoid fixed bottom CTA that obscures active fields.

On submit:

``` text
disable accidental duplicate submit
show progress without layout jump
retain user input on recoverable error
move/announce focus only when useful
```

## 92.7. Async state model

Every dynamic component that performs a request defines:

``` text
idle
loading
success
empty
error
```

where applicable.

No component may use an infinite spinner as its only failure mode.

Error copy should be calm and actionable:

``` text
retry
continue reading
try later
```

without blocking static content.

## 92.8. Reduced motion

Respect:

``` css
prefers-reduced-motion
```

Animations must not be required to understand state changes.

## 92.9. Long text resilience

UI must tolerate:

``` text
long Polish/German words
long author names
large numbers
translated labels
200% text zoom
```

Avoid fixed-height text containers for dynamic/localized copy.

## 92.10. Offline / API unavailable

The site is not required to be a PWA.

However dynamic features must fail predictably:

``` text
article remains readable
static navigation remains usable
existing SSR/static metadata remains visible
dynamic action shows local error state
```

Do not introduce service worker/offline cache merely to satisfy this
contract.

------------------------------------------------------------------------

<a id="section-93"></a>
# 93. Codex Stage Gates

Этот раздел делает Section 87 executable.

Rule:

``` text
Codex не начинает следующий major stage,
если обязательные checks текущего stage failing.
```

Если check невозможно выполнить из текущей environment, Codex фиксирует
это как explicit unresolved verification item, а не делает вид, что
проверка прошла.

## 93.1. Stage 1 --- repository skeleton

Done:

``` text
install succeeds
dev starts
build succeeds
typecheck succeeds
lint/check baseline defined
CORE/FEATURES/THEME/PROJECT folders exist
dependency direction documented
```

Forbidden:

``` text
business-specific code in CORE
global React app
```

## 93.2. Stage 2 --- content + routing + i18n

Done:

``` text
sample article renders
draft excluded in production
scheduled excluded in production
duplicate id fails build
duplicate route fails build
category validation works
author validation works
localized route generation works
canonical/hreflang pass representative test
```

## 93.3. Stage 3 --- SEO shell

Done:

``` text
title/description
canonical
hreflang
robots behavior
sitemap
RSS
breadcrumbs
BlogPosting
Person/Profile where applicable
404 real route/template behavior
redirect manifest
```

Representative pages inspected from production build HTML.

## 93.4. Stage 4 --- theme/performance baseline

Done:

``` text
article readable with JS disabled
no horizontal overflow at required widths
hero dimensions reserved
below-fold images lazy
LCP image not lazy
font set minimal
no unnecessary client:* hydration
visible focus
skip link where template uses it
```

## 93.5. Stage 5 --- Worker + D1

Done:

``` text
/health 200
local/preview DB separated from production
migrations reproducible
canonical tables match section 85
content_articles registry exists
article_stats lazy initialization test exists
secrets absent from Git
error shape matches section 83
mutation responses no-store
```

shared DTO/runtime schema source exists external inputs
runtime-validated no duplicate validation/type definitions across
Worker/Astro where contract is shared

## 93.6. Stage 6 --- Rating

Done:

``` text
personalized GET returns returning visitor myRating
first vote insert
vote update
UNIQUE invariant
aggregate correct
myRating returned
invalid vote rejected
rate limit path exists
UI failure does not break article
```

## 93.7. Stage 7 --- Comments

Done:

``` text
Turnstile server verification
normal published flow
link→pending flow
invalid reject/no store
comments_count transition tests
keyset pagination
featuredIds excluded before LIMIT
reply normalization
helpful
report
moderation transitions
```

## 93.8. Stage 8 --- Reads + snapshots

Done:

``` text
GET /v1/stats returns authoritative snapshot
qualified read condition tested
single POST per page session
simple anonymous dedup
no heartbeat
batch stats source
listing uses no N requests
snapshot failure preserves static UI
```

## 93.9. Stage 9 --- Admin + Access

Done:

``` text
admin API only behind protected path
Access policy verified
no custom auth stack
moderation actions work
delete is physical delete where specified
spam restore/purge behavior matches contract
```

## 93.10. Stage 10 --- Search

Done:

``` text
published/indexable content only
locale-aware
draft/scheduled excluded
result URL itself non-indexable by default
index generation automated in build pipeline
search failure does not affect article navigation
```

## 93.11. Stage 11 --- Deploy adapter

Done via real HTTP verification:

``` text
canonical → 200
old URL → 301 + Location
unknown → 404
/page/1/ normalized
non-canonical host normalized
http normalized to https
mutation API → no-store
hashed asset caching verified
```

## 93.12. Stage 12 --- Production QA

Done:

``` text
Search Console property
sitemap submitted
representative URL inspection
structured data validation
mobile widths
keyboard navigation
JS disabled
slow API
API unavailable
Turnstile failure
cold-load performance
no secrets exposed
no fatal console/runtime errors
```

## 93.13. Change-control rule

After implementation starts:

``` text
SPEC contract change
→ explicit diff
→ reason
→ affected stages
→ migration/compatibility impact
```

Codex must not silently reinterpret an existing contract because another
implementation seems easier.

If implementation discovers an unspecified edge case:

``` text
choose simplest compatible behavior
→ document it
→ avoid new dependency
→ avoid architecture expansion
```

If two plausible behaviors materially affect URL/data/security/SEO:

``` text
stop that specific decision
→ mark as SPEC gap
```

but continue unrelated implementation work.

## 93.14. Security Gate

До production release обязательны:

``` text
Access JWT/assertion verification for admin
mutation Origin validation
CORS allowlist
runtime validation on all external inputs
prepared D1 statements
dynamic SQL allowlists
Turnstile failure/no-write test
visitor identity cookie flags
XSS/plain-text rendering test
URL scheme validation
request-size rejection
rate-limit checks
security headers
CSP production-like verification
secret scan/manual review
public error redaction
dependency lockfile
```

Если security check падает:

``` text
production release blocked
```

Codex не должен компенсировать failing security check отключением самой
проверки.

## 93.15. Design / CSS Gate

До production release обязательны:

``` text
light/dark schemes
system preference + light fallback
semantic theme tokens
brand accent in both schemes
mobile-first CSS
required viewport QA
finite typography scale
article readable measure
hybrid featured/regular cards
focus states in both schemes
no global CSS/framework drift
no horizontal document overflow
reduced-motion verification
visual anti-pattern review
```

Если component implementation начинает создавать собственные
colors/spacing/radii без THEME contract, stage считается незавершённым.

## 93.16. Browser Compatibility Gate

До production release обязательны проверки authoritative Browser
Contract разделов 108--111:

``` text
native document scroll
no unjustified UA/device sniffing
no preventive WebKit/GPU hacks
iOS Safari portrait + landscape
Android Chrome portrait + landscape
short-height landscape behavior
browser chrome expanded/collapsed
virtual keyboard
dialog scroll lock/restoration
safe areas
light/dark first paint
orientation change
no persistent flicker/horizontal overflow
```

Browser-specific workaround без documented
reproducer/reason/scope/removal condition блокирует завершение stage.

## 93.17. Runtime Data / Operations Gate

До production обязательны sections 112–118:

``` text
content_articles registry sync
published article accepted by Worker
draft/future/removed article rejected
article_stats lazy initialization
GET /v1/stats snapshot contract
global dynamic sort verified across page boundary
credentialed API subdomain cookie/CORS verified
comment publication invariant verified
migration history reproducible
backup/export available before destructive migration
restore procedure tested non-production
structured logs redact sensitive payloads
/health reveals no secrets
retention policy documented
```

## 93.18. Final Contract Regression Gate

После всех implementation/hardening sections выполнить финальный
machine-assisted + manual audit SPEC и реализации:

``` text
unique section numbers
valid cross-references
all public endpoints use intended namespace
DTO names match runtime schemas
D1 fields match migrations
every runtime article mutation validates content registry
no competing physical schema
no duplicate authoritative ownership
no stale "to be defined later" for implemented v1 features
no architecture dependency reversal
no production gate disabled to make release pass
```

Неисправленный contradiction/ambiguous ownership блокирует production
release либо явно оформляется как SPEC gap before implementation.


<a id="section-94"></a>
# 94. Shared Runtime/API Contracts

Цель --- не допустить расхождения между Astro, Worker и UI при
сохранении простой структуры repository.

## 94.1. Один source of truth

DTO/runtime schemas, используемые одновременно frontend и Worker, имеют
один source of truth.

Примеры:

``` text
CommentCreateInput
CommentPublicDTO
RatingCreateInput
RatingMutationResponse
RatingStateResponse
ReadCreateInput
PublicArticleStatsDTO
APIErrorDTO
Cursor payload
```

Для v1 `PublicArticleStatsDTO` wire names фиксированы:

``` ts
type PublicArticleStatsDTO = {
  id: string;
  reads: number;
  commentsCount: number;
  ratingValue: number | null;
  ratingCount: number;
};
```

`ratingScore` и rolling `popularNow` score не входят в публичный article
DTO и не используются как display/schema values. Ranking snapshot
передаёт готовые ordered article ID lists согласно разделу 114.


Для v1 `CommentPublicDTO` wire names/types также фиксированы:

``` ts
type CommentPublicDTO = {
  id: string;
  parentId: string | null;
  name: string;
  body: string;
  createdAt: string; // ISO 8601 UTC serialization of created_at_ms
  helpfulCount: number;
  linkRel: "dofollow" | "nofollow" | "sponsored" | null;
};
```

D1 snake_case fields сериализуются в API camelCase одним shared mapper;
frontend не должен поддерживать одновременно две формы одного DTO.

Физическое размещение выбирается простейшее для repository, например:

``` text
src/shared/contracts/
```

или эквивалентная provider-neutral директория.

Monorepo/workspaces не являются обязательными. Создавать отдельный
package/workspace разрешено только если реальная структура repository
делает это проще, а не «на будущее».

## 94.2. Runtime validation обязательна

Каждый внешний mutation/read input, которому нельзя доверять, проходит
server-side runtime validation до бизнес-логики и D1 mutation.

Минимум:

``` text
POST /v1/read
POST /v1/comments
POST /v1/comments/{id}/helpful
POST /v1/comments/{id}/report
GET /v1/articles/{articleId}/rating path/article scope
POST /v1/articles/{articleId}/rating
admin PATCH/DELETE inputs
cursor/query parameters
```

TypeScript type alone не считается runtime validation.

## 94.3. Zod --- default implementation, не архитектурный contract

Starter MAY использовать Zod как default implementation, если это не
создаёт лишнего dependency/runtime cost.

Contract:

``` text
runtime validation mandatory
shared contract source mandatory where Astro+Worker share DTO
specific validation library not mandatory
```

Codex не должен самостоятельно добавлять вторую validation library.

Если Astro content validation уже использует Zod и reuse действительно
упрощает проект, использовать одну библиотеку предпочтительнее двух.

## 94.4. Types должны выводиться из runtime schema where practical

Если выбранная validation library поддерживает type inference:

``` text
runtime schema
→ inferred TypeScript type
```

предпочтительнее ручного дублирования:

``` text
interface X
+
отдельная несвязанная runtime schema X
```

Но D1 physical schema остаётся authoritative в разделе 85 и не
генерируется автоматически из DTO без отдельного SPEC change.

## 94.5. Boundary rule

Shared contracts могут содержать:

``` text
plain TypeScript types
runtime schemas
serialization helpers
API error codes
```

Shared contracts не содержат:

``` text
Astro components
React components
THEME
PROJECT copy
D1 binding
Cloudflare-specific request handler
business-specific recipient secrets
```

<a id="section-95"></a>
# 95. Security Contract

Цель --- задать security boundaries до начала реализации и не оставлять
Codex право «додумывать» защиту по месту.

Security model starter:

``` text
static-first public site
+
small Worker attack surface
+
strict runtime validation
+
parameterized D1 queries
+
explicit origin policy
+
rate limiting
+
Turnstile where specified
+
Cloudflare Access for admin
+
minimal dependencies
```

Не добавлять тяжёлые security/auth layers без реальной необходимости.

## 95.1. Trust boundaries

Недоверенные данные:

``` text
all request body
all query params
all path params
all headers from public clients
Turnstile token until verified
visitor_id until parsed/validated
comment body/name/link
admin mutation payload
cursor
sort/filter values
```

Доверенными являются только данные после соответствующей server-side
validation/verification.

TypeScript type не является trust boundary.

## 95.2. Admin authentication / Cloudflare Access

`/admin/*` и `/admin/api/*` доступны только через Cloudflare Access.

Worker/admin backend не должен считать request доверенным только потому,
что route находится за Access UI.

Для admin request backend должен валидировать Access assertion/JWT
согласно deployment adapter:

``` text
signature
issuer
audience
expiration
```

и отклонять invalid/missing assertion.

Не создавать собственные:

``` text
users table
password auth
session store
JWT issuer
refresh tokens
OAuth server
```

если отдельный PROJECT contract этого не требует.

## 95.3. CSRF / Origin policy

Для browser mutation endpoints обязателен explicit allowed-origin
policy.

Минимум:

``` text
POST /v1/read
POST /v1/comments
POST /v1/comments/{id}/helpful
POST /v1/comments/{id}/report
POST /v1/articles/{articleId}/rating
PATCH /admin/api/*
DELETE /admin/api/*
POST /admin/api/*
```

Rules:

``` text
browser mutation + missing Origin
→ reject by default

Origin present
→ exact match explicit PROJECT/deployment allowlist

wildcard mutation CORS
→ forbidden
```

Исключение для trusted non-browser integration допускается только если
endpoint имеет отдельный explicit authentication/integration contract; оно
не выводится автоматически из public browser route.

Admin JSON mutations дополнительно требуют:

``` text
valid Access identity
allowed Origin
expected Content-Type
runtime validation
```

Не добавлять отдельный CSRF framework, если Access +
same-site/allowed-origin JSON contract уже полностью закрывает threat
model.

Exact cross-origin credential behavior для default API subdomain задан
разделом 115.

## 95.4. Cookies and anonymous visitor identity

Если `visitor_id` хранится в cookie и frontend не должен читать его,
preferred flags:

``` text
HttpOnly
Secure
SameSite=Lax
Path=/
```

`SameSite=Strict` допустим, если не ломает нормальные entry flows.

Visitor ID:

``` text
opaque
cryptographically random
non-semantic
not derived from IP
not fingerprint
not email/name
```

Cookie value не является authentication credential.

Не использовать visitor_id как security boundary для admin/auth.

Если конкретной feature требуется browser-readable localStorage
identity, это должно быть явно описано её contract; такая identity
остаётся только anti-duplication convenience, не authentication.

## 95.5. XSS / user-generated content

User-generated content хранится и рендерится как plain text unless
explicitly modeled otherwise.

Для:

``` text
comment body
author_name
moderation_reason
user-provided link label
```

запрещено использовать:

``` text
set:html
dangerouslySetInnerHTML
raw HTML injection
untrusted MDX
```

Ссылки строятся renderer'ом из URL, валидированного по published invariant
раздела 32.5. Для comments v1 отдельный URL field не вводится: published
body может содержать максимум один допустимый URL, к которому относится
`link_rel`.

Allowed user link schemes by default:

``` text
https:
http:
```

Forbidden by default:

``` text
javascript:
data:
vbscript:
file:
```

Любая будущая поддержка дополнительной scheme требует отдельного
contract.

## 95.6. SQL / D1 injection safety

Все пользовательские значения обязаны передаваться через
parameterized/prepared D1 statements.

Forbidden:

``` text
string interpolation into SQL values
raw query concatenation from request
unvalidated dynamic table name
unvalidated dynamic column name
```

Dynamic SQL fragments such as:

``` text
ORDER BY
sort direction
filter field
```

выбираются только из server-side allowlist.

Example:

``` text
sort = "popular"
→ map to predefined SQL fragment

sort = arbitrary request string
→ never concatenate directly
```

## 95.7. Request body and parameter limits

Oversized input должен отклоняться до тяжёлой processing/database work.

Starter defaults:

``` text
comment author_name
→ max 40 chars

comment body
→ max 1500 chars

comment active link count
→ max 1 in published v1 contract

rating value
→ integer 1..5

featured excludeIds
→ max 5

pagination limit
→ server-capped

cursor
→ bounded length

JSON body
→ small endpoint-specific maximum
```

Worker должен иметь endpoint-specific body-size limits.

Не использовать один огромный универсальный body limit для всех routes.

## 95.8. Turnstile verification

Для endpoints, где Turnstile обязателен:

``` text
server-side verification mandatory
```

До успешной проверки:

``` text
no D1 mutation
no comment record
```

Где доступны/configured дополнительные claims, Worker валидирует
ожидаемые:

``` text
hostname
action
```

Environment separation:

``` text
development/test
preview
production
```

не должна приводить к случайному использованию production secret в local
development.

Turnstile verification request должен иметь network timeout/failure
handling.

Failure mode:

``` text
verification unavailable/failed
→ mutation denied safely
→ no partial write
```

## 95.9. Rate limiting / abuse control

Route-specific rate limiting сохраняется authoritative.

Не использовать один общий лимит для всех actions.

Different abuse characteristics:

``` text
read
rating
comment creation
helpful
report
admin
search/comments GET if future abuse requires
```

Public write limits должны быть достаточно мягкими для NAT/mobile users.

Не хранить raw IP в D1 для rate-limit identity.

Если platform rate limiting использует transient network metadata внутри
Cloudflare, это не означает разрешение сохранять raw IP в application
DB.

## 95.10. Security headers

Deploy adapter должен поддерживать production baseline security headers.

Required baseline where applicable:

``` text
Content-Security-Policy
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

Framing policy задаётся через CSP:

``` text
frame-ancestors
```

Не полагаться только на legacy `X-Frame-Options`, если authoritative CSP
уже используется.

HSTS включается только для production HTTPS host после проверки
корректного HTTPS deployment.

## 95.11. CSP contract

CSP должна быть совместима с фактическим Astro/Worker/Turnstile
deployment.

Default goal:

``` text
default-src 'self'
script-src narrowly scoped
style-src narrowly scoped
img-src only required origins/data policy
connect-src only required API origins
frame-src only required embedded services
object-src 'none'
base-uri 'self'
frame-ancestors controlled
```

Не копировать generic permissive CSP ради устранения ошибок.

Запрещено добавлять без явной необходимости:

``` text
script-src *
unsafe-eval
broad connect-src *
broad frame-src *
```

Если Turnstile или другой утверждённый provider требует origin, он
добавляется точечно.

Nonce/hash based policy предпочтительна permissive inline-script policy
там, где это реально оправдано implementation.

CSP сначала проверяется на production-like preview, затем включается как
blocking policy.

## 95.12. Secrets

Secrets never belong in:

``` text
Git
public Astro env
client bundle
generated HTML
logs
error payloads
screenshots/documentation examples with real value
```

Examples:

``` text
Turnstile secret
Cloudflare API token
D1/admin credential
Access service token/private key
external CRM/email secret
```

Public configuration such as site key/origin is not treated as secret
unless provider defines otherwise.

Production build/check should fail where practical when required
secrets/config are missing or obvious placeholder/test values are used
in production.

## 95.13. Logging and error privacy

Application logs must not unnecessarily contain:

``` text
Access JWT
full visitor cookie
Turnstile secret
Authorization header
full raw request body
private admin payload
stack traces returned to public client
SQL statement with sensitive values
```

Public API errors expose:

``` text
stable machine code
safe message/field errors
request correlation id if implemented
```

but not:

``` text
SQL error
stack
filesystem path
secret
internal Cloudflare token
```

## 95.14. Dependency / supply-chain policy

Repository commits lockfile.

Codex must not add dependency when platform/native API or existing
dependency solves the task simply.

Before adding runtime package, check:

``` text
purpose
maintenance status
bundle/runtime cost
security surface
existing equivalent dependency
```

Forbidden by default:

``` text
two libraries for same validation purpose
large utility library for one helper
abandoned auth/security package
package installed only for trivial random/string/date helper
```

Dependency update process should include periodic audit/review, but
starter does not require automated third-party security SaaS.

## 95.15. File/content build safety

Build-time content is trusted editorial input, but validator still
rejects malformed contracts.

If future uploads are introduced:

``` text
file type
size
extension
content signature
storage
serving headers
```

must get a separate upload security contract.

Current starter does not implement arbitrary public file upload.

## 95.16. Security failure behavior

Security validation failure must fail closed for mutation/auth.

Examples:

``` text
invalid Access assertion
→ deny admin request

Turnstile unavailable
→ deny protected comment mutation

invalid Origin
→ deny mutation

invalid body
→ reject/no write

invalid cursor
→ safe 4xx, no fallback raw query
```

But dynamic security failure must not break already generated static
article content.

## 95.17. Explicitly forbidden security overengineering

Without a concrete requirement, do not add:

``` text
custom authentication system
Vault
KMS abstraction layer
ORM merely for security
service mesh
queue
WAF rule set in application code
SIEM
custom encryption framework
PWA/service worker as security layer
client-side crypto for ordinary public comments
```

Prefer platform capabilities + small explicit contracts.

## 95.18. Security Definition of Done

Before production:

``` text
Access-protected admin verified
invalid Access assertion rejected
mutation Origin policy tested
CORS wildcard absent for mutations
visitor cookie flags verified
XSS payload renders as text
javascript: link rejected
oversized body rejected
invalid rating rejected
SQL injection payload does not alter query structure
dynamic sort uses allowlist
Turnstile failure creates no DB row
rate limits return expected 429 behavior
security headers present
CSP tested in production-like environment
HSTS enabled only on final HTTPS host
no secrets in client bundle
no secrets in Git
public errors contain no stack/SQL
dependency lockfile committed
```

<a id="section-96"></a>
# 96. Visual Design Direction

Цель --- ограничить визуальную самодеятельность Codex, не превращая SPEC
в замену Figma.

## 96.1. Общий характер

Для первого PROJECT (`tragarze.pl`) visual direction:

``` text
≈ 60% Vercel
≈ 40% Linear
```

Это не означает копирование конкретных страниц, компонентов или
branding.

Из Vercel берём:

``` text
пространство и визуальный воздух
сильную типографическую иерархию
чистую сетку
контраст
минимум декоративного шума
editorial/product feeling
```

Из Linear берём:

``` text
аккуратную информационную плотность
тонкие borders/dividers
проработанные небольшие controls
точные interactive states
сдержанные surfaces
ощущение законченного digital product
```

Итог:

``` text
modern editorial/product publication
```

а не:

``` text
generic WordPress theme
SaaS dashboard
AI-generated landing page
```

## 96.2. Theme ownership

``` text
CORE
→ no project colors/fonts/radii/shadows

FEATURES
→ semantics + behavior + accessibility
→ no concrete project visual identity

THEME
→ tokens + typography + layout + component presentation
→ responsive visual behavior

PROJECT
→ brand accent + theme configuration + project assets
```

THEME не импортирует PROJECT напрямую. PROJECT передаёт branding/config
через typed composition boundary раздела 89.1.1.

## 96.3. Brand accent

PROJECT имеет один основной фирменный accent concept.

Accent используется намеренно для:

``` text
primary CTA
active/selected state
important links
focus indication where appropriate
small emphasis
interactive feedback
```

Accent не должен превращаться в декоративную заливку всего интерфейса.

Light и dark schemes могут использовать разные derived values accent по:

``` text
lightness
saturation
contrast
```

при сохранении одной brand identity.

------------------------------------------------------------------------

<a id="section-97"></a>
# 97. CSS Architecture

## 97.1. CSS-first

Обычная визуальная стилизация выполняется CSS.

Не использовать React/JS для:

``` text
breakpoints
hover
focus
basic show/hide where CSS/native HTML suffices
color scheme detection
ordinary responsive layout
```

## 97.2. Recommended structure

Физические имена могут немного отличаться, но ownership должен
оставаться эквивалентным:

``` text
src/theme/styles/
├ tokens.css
├ reset.css
├ base.css
├ typography.css
├ layout.css
├ utilities.css
└ components/
   ├ header.css
   ├ navigation.css
   ├ article-card.css
   ├ article.css
   ├ toc.css
   ├ author.css
   ├ comments.css
   ├ forms.css
   └ ...
```

Не создавать один бесконтрольный global stylesheet на тысячи строк.

## 97.3. Design constants

Повторяемые design constants живут в tokens.

Forbidden:

``` css
/* одинаковый смысл, случайные значения */
padding: 17px;
padding: 19px;
padding: 21px;

color: #e6e6e6;
color: #e8e8e8;
color: #e7e7e7;
```

если это не осознанные разные tokens.

Component-local value допустим, если он действительно уникален и не
является скрытым глобальным design token.

## 97.4. Specificity

Предпочитать:

``` text
simple class selectors
semantic component classes
low specificity
cascade layers if implementation реально выигрывает от них
```

Избегать:

``` text
deep descendant chains
!important as normal workflow
ID selectors for styling
inline design constants
```

`!important` допустим только как документированное исключение.

## 97.5. No framework drift

Не добавлять Bootstrap/Tailwind/utility CSS framework/component design
system без explicit SPEC change.

Небольшой собственный utilities layer допустим, но не должен
превращаться в самодельный Tailwind.

------------------------------------------------------------------------

<a id="section-98"></a>
# 98. Design Tokens

## 98.1. Semantic first

Основные tokens именуются по назначению, а не по случайному цвету:

``` css
--color-bg
--color-surface
--color-surface-raised
--color-text
--color-text-muted
--color-border
--color-border-strong
--color-accent
--color-accent-hover
--color-focus
--color-danger
--color-success
```

Не использовать в component API:

``` text
gray-437
blue-600-for-button
random-dark-border
```

как основной semantic contract.

## 98.2. Spacing scale

THEME определяет ограниченную spacing scale:

``` text
--space-1
--space-2
--space-3
...
```

Компоненты преимущественно используют её.

Не требуется искусственно загонять абсолютно каждый оптический offset в
scale.

## 98.3. Geometry

THEME имеет небольшой контролируемый набор:

``` text
radius
border width
shadow
container widths
article measure
page gutters
header dimensions
```

Не создавать новый radius/shadow для каждого компонента.

## 98.4. Typography tokens

Минимум:

``` text
--font-body
--font-heading
--font-mono

--text-caption
--text-small
--text-body
--text-lead
--text-h4
--text-h3
--text-h2
--text-h1
--text-display
```

THEME может использовать одну family одновременно для body/headings.

## 98.5. Responsive tokens

Использовать `clamp()` для fluid values только там, где это улучшает
layout.

Не делать каждый размер fluid.

Breakpoints являются layout decisions, а не списком конкретных
устройств.

------------------------------------------------------------------------

<a id="section-99"></a>
# 99. Color Schemes

## 99.1. Required modes

v1 поддерживает:

``` text
light
dark
```

Initial mode:

``` text
user/system prefers-color-scheme
→ соответствующая scheme

не удалось определить
→ light
```

## 99.2. Semantic token switching

Light/dark не реализуются двумя копиями component CSS.

Правильная модель:

``` text
semantic tokens
→ light values
→ dark values
```

Компонент использует:

``` css
color: var(--color-text);
background: var(--color-surface);
border-color: var(--color-border);
```

а не собственные hardcoded light/dark colors.

## 99.3. Future manual switch

v1 не обязан иметь ручной theme switcher.

Но architecture должна позволять позже добавить:

``` text
system
light
dark
```

без переписывания component styles.

## 99.4. Dark mode quality

Dark mode не является простым:

``` text
#fff → #000
#000 → #fff
```

Необходимо отдельно проверить:

``` text
text contrast
muted text
borders
surfaces
images
code blocks
forms
focus
accent
hover/selected states
```

Избегать чрезмерно яркого чисто-белого текста на чисто-чёрном фоне, если
более мягкая semantic pair улучшает чтение.

## 99.5. Native controls

Где применимо:

``` css
color-scheme: light dark;
```

или эквивалентная scheme declaration должна помогать browser-native
controls соответствовать активной теме.

------------------------------------------------------------------------

<a id="section-100"></a>
# 100. Typography System

## 100.1. Finite scale

UI не должен постепенно получить десятки случайных размеров текста.

Основная шкала:

``` text
caption
small
body
lead
h4
h3
h2
h1
display
```

Каждый token определяет согласованный набор:

``` text
font-size
line-height
font-weight
letter-spacing where needed
```

## 100.2. Reading typography

Long-form article typography оптимизируется отдельно от compact UI.

Baseline:

``` text
body ≈ 16–18px
line-height ≈ 1.55–1.7
desktop readable measure ≈ 60–75 characters
```

THEME выбирает точные значения после visual implementation.

## 100.3. Headings

Heading hierarchy должна быть визуально очевидной без чрезмерных скачков
размера.

Не использовать огромный display/H1 только ради визуального эффекта.

На маленьком viewport H1 должен оставлять место для:

``` text
metadata
intro/lead
first content
```

без превращения первого экрана почти полностью в заголовок.

## 100.4. Long localized copy

Typography/layout должны выдерживать:

``` text
Polish
German
long names
long headings
large numbers
200% text zoom
```

Не обрезать важные заголовки `text-overflow: ellipsis` по умолчанию.

------------------------------------------------------------------------

<a id="section-101"></a>
# 101. Layout & Grid

## 101.1. Mobile-first source layout

CSS строится:

``` text
base/mobile layout
→ enhancement at larger widths
```

а не:

``` text
desktop layout
→ серия исправлений для mobile
```

## 101.2. Core layout primitives

THEME определяет минимум:

``` text
page container
content container
article measure
wide content area
grid
stack
cluster/inline group
```

Не создавать уникальную layout system на каждой странице.

## 101.3. Article width

Основной текст статьи имеет ограниченную readable width.

Допускается более широкая область для:

``` text
hero
large figure
table
code
selected callout
```

но prose не растягивается на всю desktop ширину.

## 101.4. Editorial listing grid

Mobile:

``` text
1 column
```

Larger viewports могут переходить:

``` text
1 → 2 → 3 columns
```

только когда карточка сохраняет нормальную читаемость.

Количество колонок определяется доступной шириной/контентом, а не
желанием заполнить экран.

## 101.5. Gutters

Page gutter должен оставаться комфортным на 320px.

Не использовать большой desktop padding на маленьком viewport.

Safe-area handling следует разделу 92 и не подменяет normal page gutter.

------------------------------------------------------------------------

<a id="section-102"></a>
# 102. Editorial Cards

## 102.1. Hybrid model

Используется гибрид:

``` text
featured/editorial card
+
regular compact cards
```

Не все материалы должны иметь одинаковый visual weight.

## 102.2. Featured content

Featured material может иметь:

``` text
larger image
larger title
more breathing room
optional short description
```

Но не превращается в огромный marketing hero.

## 102.3. Regular cards

Обычная card ориентирована на быстрое сканирование:

``` text
image where applicable
category/context
title
minimal useful metadata
```

Не перегружать:

``` text
reads
comments
rating
author
date
reading time
tags
badges
```

одновременно, если это ухудшает hierarchy.

Extended metadata доступна через уже утверждённые metadata patterns.

## 102.4. Mobile cards

На mobile:

``` text
single readable flow
predictable image ratio
clear title
comfortable tap area
```

Избегать бесконечной ленты огромных одинаковых image banners.

## 102.5. Card click behavior

Не делать всю сложную карточку искусственной кнопкой, если внутри есть
несколько independent links/actions.

Primary article link должен оставаться semantic `<a>`.

------------------------------------------------------------------------

<a id="section-103"></a>
# 103. Article / Editorial Visual Contract

## 103.1. Article hierarchy

Typical order:

``` text
breadcrumb/context
category where applicable
H1
lead/description where applicable
compact metadata
hero/figure where applicable
article body
author/editorial attribution
related content
comments/rating according to feature layout
```

THEME может визуально адаптировать порядок второстепенных элементов, не
ломая semantic/SEO contract.

## 103.2. Article body

Поддерживаемые MDX elements должны выглядеть частью одной системы:

``` text
H2/H3/H4
paragraph
list
blockquote
figure
figcaption
table
code
callout
links
```

Не стилизовать каждый элемент как отдельную карточку.

## 103.3. Images

Image presentation должна учитывать:

``` text
aspect ratio
caption
credit
light/dark surrounding surface
mobile edge cases
```

Не применять декоративный radius/shadow автоматически ко всем
изображениям.

## 103.4. Tables/code

Wide content может выходить за prose measure внутри контролируемого
container, но не создавать horizontal scrolling всего document.

------------------------------------------------------------------------

<a id="section-104"></a>
# 104. Component Visual States

Interactive components определяют, где применимо:

``` text
default
hover
active
focus-visible
selected
disabled
loading
error
success
```

## 104.1. Focus

`focus-visible` должен быть заметен в обеих color schemes.

Не удалять outline без равноценной замены.

## 104.2. Hover

Hover является enhancement.

Критическая информация/действие не может существовать только на hover.

## 104.3. Disabled

Disabled control визуально отличается, но текст/состояние остаются
читаемыми.

## 104.4. Loading

Loading state не должен:

``` text
обнулять высоту блока
скрывать уже доступный static content
создавать заметный CLS
```

## 104.5. Motion

Motion:

``` text
short
subtle
functional
```

Не использовать animation просто для демонстрации «современности».

`prefers-reduced-motion` contract из раздела 92 обязателен.

------------------------------------------------------------------------

<a id="section-105"></a>
# 105. Responsive Design Contract

## 105.1. Required widths

Visual QA минимум:

``` text
320
360
375
390
430
768
1024
1440
```

## 105.2. Breakpoint behavior

Media query добавляется из-за изменения layout requirement, а не потому
что существует конкретная модель устройства.

## 105.3. Navigation

Mobile header:

``` text
не перегружен
primary navigation доступна
secondary actions не конкурируют за первый экран
```

Desktop может раскрывать больше navigation/context.

## 105.4. TOC/sidebar

Desktop TOC/sidebar может быть persistent/sticky.

На narrow layout он становится:

``` text
inline
disclosure
compact navigation
```

а не сжимает prose до неудобной ширины.

## 105.5. Pointer differences

Не предполагать hover capability по ширине viewport.

Где behavior зависит от hover/pointer, использовать соответствующие
media features или progressive enhancement.

------------------------------------------------------------------------

<a id="section-106"></a>
# 106. Visual Anti-patterns

Для первого THEME запрещены без explicit design reason:

``` text
giant marketing H1
gradient soup
glassmorphism
decorative glow
cards inside cards inside cards
shadow on every card
pill-shaped everything
random border radii
random gray shades
icon next to every label
decorative animation everywhere
desktop layout squeezed onto mobile
different spacing for equivalent situations
inline hardcoded design constants
unnecessary sticky elements
huge empty hero before useful content
overloaded metadata rows
```

Также избегать типичных AI-generated landing patterns:

``` text
generic badge above every heading
three identical feature cards everywhere
meaningless gradient orb backgrounds
excessive centered text
marketing CTA after every section
```

Minimalism не означает отсутствие hierarchy, а visual richness не
означает декоративный шум.

------------------------------------------------------------------------

<a id="section-107"></a>
# 107. Design / CSS Definition of Done

До production THEME должен пройти:

## Visual system

``` text
light scheme complete
dark scheme complete
system preference works
light fallback defined
brand accent consistent
semantic tokens used
no accidental hardcoded theme colors in reusable components
```

## CSS

``` text
no framework drift
no uncontrolled global stylesheet
no routine !important
no duplicate random spacing/color constants
component CSS ownership understandable
```

## Typography

``` text
finite type scale
article readable
headings hierarchical
long localized headings tested
200% text zoom usable
```

## Layout

``` text
320–1440 widths checked
no document horizontal overflow
article measure controlled
wide tables/code local overflow only
featured + regular card hierarchy works
```

## Interaction

``` text
hover/focus/active/disabled states coherent
focus visible in light and dark
touch targets satisfy UX contract
reduced motion works
loading/error states do not jump layout
```

## Editorial pages

``` text
article page
blog listing
category listing
author profile
pagination
404
search UI
comments/rating areas
```

visually belong to one THEME.

## Final rule

Codex must not solve an undefined visual detail by inventing a new
visual language.

Preferred decision order:

``` text
existing token
→ existing component pattern
→ closest established visual rule
→ smallest new THEME-local rule
```

If a new rule would affect multiple component families, it should become
an explicit token/pattern rather than repeated local CSS.

<a id="section-108"></a>
# 108. Browser Behavior & Platform Quirks

Цель --- обеспечить устойчивое поведение THEME на современных iOS Safari
и Android Chromium без превращения проекта в набор browser-specific
hacks.

## 108.1. Decision order

Любая проблема browser behavior решается в порядке:

``` text
standard HTML/CSS
→ existing THEME/layout contract
→ progressive enhancement
→ feature/capability detection
→ reproduction in affected browser
→ smallest isolated workaround
```

Codex не должен добавлять workaround «на всякий случай».

## 108.2. No device sniffing

Для layout, scrolling, viewport и visual behavior запрещён
device/User-Agent sniffing вида:

``` js
navigator.userAgent.includes("iPhone")
navigator.userAgent.includes("Android")
```

Исключение возможно только для подтверждённого browser bug, который
невозможно надёжно определить capability/feature detection и который
документирован рядом с workaround.

Предпочитать:

``` text
@supports
media queries
container queries
pointer
hover
orientation only where semantically relevant
VisualViewport only where genuinely required
```

## 108.3. Browser-specific CSS workaround policy

Следующие техники не являются default fixes:

``` text
-webkit-overflow-scrolling
-webkit-fill-available
translateZ(0)
translate3d(0,0,0)
backface-visibility:hidden
will-change:transform
body/html overflow:hidden
position:fixed on body
touch-action:none
overscroll-behavior:none globally
```

Если workaround действительно нужен, он обязан быть:

``` text
minimal
local
reproducible
commented
removable
```

Комментарий/issue note должен фиксировать минимум:

``` text
problem
affected browser/behavior
why standard solution is insufficient
scope
fallback
condition for future removal
```

Нельзя распространять локальный compositor/scroll fix на весь сайт.

## 108.4. Flicker classification

Codex не должен лечить любое «мигание» GPU/compositor hack.

Сначала определить класс проблемы:

``` text
layout shift
theme flash
font swap
paint/compositing flicker
image/content dimension shift
hydration mismatch
```

Preferred fixes:

``` text
layout shift
→ reserve dimensions / aspect-ratio / stable fonts / stable content

theme flash
→ scheme available before first paint

font flash
→ correct font loading strategy

hydration mismatch
→ remove unnecessary hydration / deterministic server markup

compositor flicker
→ reproduce first, then smallest isolated workaround
```

------------------------------------------------------------------------

<a id="section-109"></a>
# 109. Scroll, Viewport & Browser Chrome Contract

## 109.1. Document scrolling

Обычная content page использует native document vertical scrolling:

``` text
html/body
→ normal document scroll
```

Запрещено без функциональной необходимости превращать весь сайт в:

``` text
body overflow:hidden
main height:100dvh
main overflow:auto
```

Article, listing, category, author profile и обычные static pages не
должны жить внутри custom root scroll container.

## 109.2. Scroll behavior

Smooth scrolling является progressive enhancement.

Не перехватывать wheel/touch scroll JavaScript-ом для обычной навигации.

Не создавать custom momentum scrolling.

Anchor navigation должна работать без JS.

Sticky/fixed UI не должен ломать anchor positioning; использовать
установленный `scroll-margin`/header offset contract.

## 109.3. Overscroll

Не отключать browser-native overscroll/pull-to-refresh глобально без
подтверждённой UX необходимости.

`overscroll-behavior` допустим локально для:

``` text
dialog
drawer
nested scroll region
```

если это предотвращает scroll chaining и не ломает ожидаемое browser
behavior.

## 109.4. Viewport units

Не строить обычный page layout вокруг JS `window.innerHeight`.

Для fullscreen-like UI, где viewport height действительно важен,
предпочитать современные viewport units:

``` text
dvh
svh
lvh
```

с graceful fallback там, где он требуется.

`100vh` не является универсальным решением для mobile fullscreen UI.

## 109.5. Browser chrome

UI должен оставаться рабочим при:

``` text
mobile browser bars expanded
mobile browser bars collapsed
scroll direction changes browser chrome
```

Нельзя предполагать постоянную visual viewport height на мобильном
браузере.

## 109.6. Safe areas

`env(safe-area-inset-*)` применяется только к UI, который реально
прилегает к соответствующему viewport edge.

Не добавлять safe-area padding каждому container.

Нужно исключить double-padding:

``` text
normal page gutter
+
safe-area inset
```

там, где оба значения не должны суммироваться.

## 109.7. Software keyboard

При открытии virtual keyboard:

``` text
focused field remains reachable/visible
submit action remains reachable
fixed/sticky CTA does not cover field
dialog remains operable
document does not become permanently scroll-locked
```

Не использовать глобальный resize listener только ради
предположительного keyboard fix.

`VisualViewport` допустим только если конкретный interaction нельзя
корректно реализовать CSS/native browser behavior.

## 109.8. Scroll locking

Scroll lock разрешён для настоящих modal/dialog states.

После закрытия:

``` text
original scroll position preserved
document scroll restored
no horizontal jump
no permanent body style remains
```

Предпочитать native `<dialog>`/platform behavior where suitable согласно
существующему component contract.

## 109.9. Scroll restoration

Обычная browser back/forward navigation должна сохранять ожидаемое
native scroll restoration.

Не переопределять `history.scrollRestoration` глобально без доказанной
необходимости.

------------------------------------------------------------------------

<a id="section-110"></a>
# 110. Portrait & Landscape Contract

## 110.1. Orientation principle

Layout преимущественно определяется доступным пространством, а не
названием orientation.

Preferred:

``` text
container width
available height where relevant
pointer/hover capabilities
```

`orientation` media query используется только если сама геометрия
portrait/landscape меняет UX.

## 110.2. Landscape phone is not desktop

Критическое правило:

``` text
landscape phone ≠ desktop
```

Широкий viewport телефона не означает:

``` text
desktop navigation
desktop sidebar
desktop hover assumptions
desktop spacing
desktop-sized sticky header
```

Touch input и малая viewport height остаются ограничениями.

## 110.3. Low-height layouts

При небольшой высоте viewport THEME должен избегать:

``` text
high hero blocks
large vertical gaps
sticky header occupying excessive viewport height
oversized modal header/footer
bottom sheet taller than usable viewport without internal strategy
```

При необходимости component может использовать height-aware media query.

## 110.4. Orientation-specific component changes

Допустимые примеры:

``` text
bottom sheet → centered/fullscreen dialog in short landscape viewport
reduced vertical spacing
compact sticky controls
different media composition
```

Недопустимо создавать отдельную полноценную landscape theme.

## 110.5. Required geometry QA

Минимально проверять:

``` text
phone portrait:
320–430 CSS px width

phone landscape:
representative short-height layouts around
568×320
667×375
844×390

tablet portrait
tablet landscape
```

Это geometry targets, а не device-specific CSS targets.

------------------------------------------------------------------------

<a id="section-111"></a>
# 111. Browser Workaround & Compatibility Gate

## 111.1. Required browsers

Production QA минимум:

``` text
current iOS Safari
current Android Chrome/Chromium
current desktop Chrome
current desktop Safari where available
current Firefox
```

Не требуется pixel-perfect identical rendering.

Требуется одинаковая:

``` text
usability
content access
interaction correctness
semantic behavior
critical visual hierarchy
```

## 111.2. Required mobile scenarios

До production проверить минимум:

``` text
iOS Safari portrait
iOS Safari landscape
Android Chrome portrait
Android Chrome landscape
browser bars expanded
browser bars collapsed
software keyboard open
sticky header during scroll
dialog/drawer open and close
safe-area edges
anchor navigation
back/forward scroll restoration
light first paint
dark first paint
orientation change while page is open
```

## 111.3. Failure criteria

Gate не пройден, если наблюдается:

``` text
persistent visual flicker
theme flash caused by implementation
document horizontal overflow
content hidden under fixed/sticky UI
broken scroll after dialog close
keyboard covering active form without recovery
unexpected desktop layout on landscape phone
layout jump caused by unnecessary hydration
global workaround for a local browser issue
UA sniffing without documented exception
```

## 111.4. Codex behavior

Если Codex обнаруживает browser-specific issue:

``` text
1 reproduce
2 identify minimal scope
3 try standards-based fix
4 add regression test/check where practical
5 only then add workaround
6 document why workaround exists
```

Запрещено «исправлять» Browser Gate отключением теста, скрытием
проблемного UI или добавлением глобального CSS hack без root-cause
analysis.

<a id="section-112"></a>
# 112. Runtime Content Registry & Article Lifecycle

## 112.1. Ownership

Astro Content Collections остаются source of truth для:

``` text
article existence
lifecycle
locale
route
title/body/card metadata
```

D1 `content_articles` является только runtime allowlist для Worker.

Он не становится второй CMS.

## 112.2. Build artifact

Production build/check генерирует provider-neutral registry artifact,
содержащий минимум:

``` text
site_id
article_id
publish_at_ms
runtime_enabled
```

Artifact строится только из уже validated content model.

Draft/future content не может случайно стать runtime-enabled из-за ручной
записи в D1.

## 112.3. Deployment sync

Deploy pipeline синхронизирует registry с D1.

Для новой статьи:

``` text
validate/build
→ enable article in runtime registry
→ publish static page
→ verify runtime endpoint
```

Для удаления:

``` text
publish redirect/404/410 behavior
→ verify public HTTP state
→ disable runtime mutations for old article_id
```

Краткое окно, в котором removed article ещё runtime-enabled, допустимо;
обратная ситуация, когда опубликованная новая статья сразу получает
`invalid article_id`, должна предотвращаться deployment order.

## 112.4. Slug/route changes

Если меняется только slug/route:

``` text
article_id stays the same
runtime data stays attached
redirectFrom handles old route
```

Никакой migration comments/rating/stats не требуется.

## 112.5. Removal

При permanent removal:

``` text
content_articles.runtime_enabled = 0
new reads/comments/ratings rejected
existing runtime rows retained by default
```

Retention не означает публичную доступность removed article.

Physical purge выполняется только явной maintenance command/policy, не
автоматически при удалении MDX.

## 112.6. Merge

Автоматическое объединение runtime data двух article IDs запрещено.

Если editorial merge требует перенести comments/rating/stats:

``` text
explicit maintenance operation
→ documented source ID
→ documented destination ID
→ validation
→ aggregate repair
```

Redirect сам по себе не переносит runtime identity.

---

<a id="section-113"></a>
# 113. Aggregate Initialization & Snapshot Ownership

## 113.1. Lazy `article_stats`

После успешной проверки `content_articles` Worker гарантирует наличие
aggregate row простым idempotent pattern:

``` sql
INSERT INTO article_stats (
  site_id,
  article_id,
  reads,
  comments_count,
  rating_sum,
  rating_count,
  updated_at_ms
)
VALUES (?, ?, 0, 0, 0, 0, ?)
ON CONFLICT(site_id, article_id) DO NOTHING;
```

или эквивалентным D1-safe pattern.

Каждая feature не изобретает собственный способ создания aggregate row.

## 113.2. Atomic mutations

После initialization feature меняет только агрегаты, которыми владеет
раздел 85.8.

Source row mutation и aggregate transition выполняются одним
поддерживаемым atomic D1/Worker pattern where required.

Partial success, при котором vote/comment изменился, а aggregate нет,
считается ошибкой implementation.

## 113.3. Public snapshot owner

Worker является единственным runtime owner публичного stats/ranking
snapshot.

Default logical endpoint:

``` text
GET /v1/stats
```

Site определяется trusted origin/site mapping, а не слепо доверенным
`site_id` query parameter.

Response cacheable согласно разделу 82.

## 113.4. Snapshot shape

Минимально:

``` json
{
  "generatedAt": "2026-09-13T04:00:00Z",
  "articles": [
    {
      "id": "01K...",
      "reads": 3821,
      "commentsCount": 27,
      "ratingValue": 4.63,
      "ratingCount": 128
    }
  ],
  "rankings": {
    "popularNow": ["01J...", "01K..."],
    "popular": ["01K...", "01J..."],
    "comments": ["01J...", "01K..."],
    "rating": ["01K...", "01H..."]
  }
}
```

`rankings` содержит только runtime-enabled article IDs.

`popularNow` вычисляется из `article_read_daily` за configured
`popularityWindowDays`; `popular` остаётся all-time ranking по
`article_stats.reads`.

`ratingScore` вычисляется Worker и используется для порядка `rating`, но
не публикуется как article field.

## 113.5. Build snapshot

Astro build MAY получить последний valid public snapshot для:

``` text
initial visible stats
JSON-LD aggregateRating
featured/static enhancements
```

Если runtime snapshot временно недоступен:

``` text
build не падает только из-за dynamic stats
→ используется последний валидный cached build snapshot where available
→ либо dynamic fields omitted according to existing SEO contract
```

Worker runtime snapshot и build copy не являются двумя source of truth:
build copy --- только зафиксированная во времени копия Worker aggregate
state.

---

<a id="section-114"></a>
# 114. Dynamic Sorting & Static Pagination Delivery

## 114.1. Problem being solved

`/page/N/?sort=popularNow|popular|rating|comments|updated` должен означать страницу N
**глобально отсортированной коллекции**, а не сортировку только тех 20
карточек, которые были статически отрендерены для `newest`.

Сортировать только текущую static page запрещено.

## 114.2. Build-time listing manifest

Astro build генерирует компактный locale-aware listing manifest с
минимальными card data для всех published entries, которые могут
участвовать в сортируемых коллекциях.

Минимально entry содержит:

``` text
article_id
canonical URL
locale
publishDate
updatedDate where present
updateNote where present
category/tag/person membership needed by enabled listings
card title
card image reference where required
small card metadata required by THEME
```

Article body/MDX в manifest не включается.

Manifest является static fingerprinted asset и принадлежит build/content
layer, не D1.

## 114.3. Lazy enhancement

Default `newest` page:

``` text
работает полностью из static HTML
не требует listing manifest/stats request для основного content
```

При выборе/открытии любого non-default sort frontend лениво получает
listing manifest.

Для runtime sorts:

``` text
popularNow
popular
rating
comments
```

дополнительно загружается:

``` text
GET /v1/stats cached snapshot
```

Для build-time `updated` stats request не требуется: порядок вычисляется
из `updatedDate` в listing manifest.

Далее frontend выполняет:

``` text
collection membership filter
→ obtain authoritative order for selected sort
→ page slice
→ render card data from manifest
```

Один listing не делает N article API requests.

## 114.4. Ranking order

Worker rankings являются authoritative для:

``` text
popularNow
popular
comments
rating
```

Worker использует `content_articles.publish_at_ms` как content-derived
tie-breaker и stable `article_id` как последний ключ. Поэтому ему не
нужно дублировать title/slug/card metadata в D1.

Tie-breakers соответствуют разделам 74.10 и 75.15.

`newest` и `updated` остаются build-time/editorial orders. `updated`
строится только из реального MDX `updatedDate`; статьи без него не
включаются в updated ranking.

## 114.5. No-JS / failure

При disabled JS или unavailable dynamic API:

``` text
canonical static newest HTML remains usable
```

Query-sort не должен разрушать страницу.

Если dynamic sort не удалось построить, UI сообщает ошибку/возвращается
к newest согласно разделам 74.14 и 74.16.

## 114.6. Scale boundary

v1 intentionally использует static listing manifest + cached rankings.

Codex не должен самостоятельно переносить article card content в D1,
добавлять SSR или новый search/ranking backend.

Если manifest становится доказуемым performance bottleneck, это
отдельный SPEC change с измерениями.

---

<a id="section-115"></a>
# 115. API Deployment, Visitor Cookie & Credentialed CORS

## 115.1. Default deployment

Default v1 production mode:

``` text
site: https://example.com
API:  https://api.example.com
```

Supported alternative:

``` text
https://example.com/api/v1/...
```

если deploy adapter реально маршрутизирует Worker на основном host.

## 115.2. Cross-origin API fetch

Для default API subdomain browser client использует:

``` js
fetch(apiUrl, {
  credentials: "include"
})
```

для routes, которым нужен anonymous visitor cookie.

Worker отвечает только exact разрешённому Origin.

Credentialed response:

``` text
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Credentials: true
Vary: Origin
```

`Access-Control-Allow-Origin: *` вместе с credentials запрещён.

Preflight разрешает только реально используемые methods/headers.

## 115.3. Visitor cookie

Default anonymous visitor cookie является host-only cookie API host:

``` text
Domain attribute omitted
Path=/
HttpOnly
Secure
SameSite=Lax
```

Cookie не должен быть доступен frontend JavaScript.

Не расширять `Domain=.example.com` без доказанной необходимости.

Same-origin mode использует те же security flags.

## 115.4. Site identity

Worker устанавливает `site_id` из server-side mapping:

``` text
allowed Origin / deployment host
→ site_id
```

Присланный browser `site_id` может использоваться только как
дополнительное validated consistency value, но не как authority.

## 115.5. Read-only public GET

Public cacheable GET, не требующий visitor identity, не обязан быть
credentialed.

Если один endpoint меняет response по cookie, его cache semantics должны
явно исключать смешивание персонализированного и общего cache.

## 115.6. Admin

Admin `/admin/*` и `/admin/api/*` остаются отдельным Cloudflare Access
boundary согласно разделу 95 и не используют anonymous visitor cookie как
auth.

---

<a id="section-116"></a>
# 116. Comment Publication Invariants

Этот раздел не вводит новую comments model, а делает межсекционные
инварианты sections 32/85/95 явными.

## 116.1. Published invariant

Каждый published comment удовлетворяет:

``` text
plain-text body
author_name 1..40
body 1..1500
0 URL OR exactly 1 valid http/https URL
2+ URL impossible in published state
link_rel null if 0 URL
link_rel allowed enum if 1 URL
```

## 116.2. Renderer

Renderer:

``` text
escapes body as text
detects only the one validated URL where present
creates <a> itself
maps logical link_rel according to section 32.5
never emits rel="dofollow"
never renders user HTML
```

`javascript:`, `data:`, `vbscript:`, `file:` не становятся links.

## 116.3. Moderation

Admin v1 не редактирует body.

Комментарий с 2+ URL:

``` text
pending
→ spam/delete
```

а не «publish with one of several links».

Это intentionally simpler than adding a CMS editor.

---

<a id="section-117"></a>
# 117. D1 Migrations, Backup, Restore & Rollback

## 117.1. Migration ownership

Canonical schema раздела 85 меняется только versioned migrations.

Запрещено:

``` text
ручное изменение production schema без migration
destructive migration без backup/rollback plan
редактирование уже применённой historical migration
```

## 117.2. Safe migration style

Предпочитать expand/contract:

``` text
add compatible schema
→ deploy code that understands both where needed
→ migrate/backfill
→ verify
→ remove obsolete schema in later migration
```

Не объединять опасное destructive schema change и необратимый deploy в
один непрозрачный шаг.

## 117.3. Backup

Перед destructive production migration обязателен restorable D1 backup
или provider-supported export/snapshot.

Backup должен быть идентифицируем по:

``` text
environment
timestamp
migration/version
```

Не хранить production database dump в public Git repository.

## 117.4. Restore rehearsal

До первого production launch должна быть документирована и хотя бы один
раз проверена на non-production data процедура:

``` text
backup/export
restore
migration re-apply if required
Worker reconnect
aggregate verification
```

## 117.5. Application rollback

Worker rollback должен учитывать schema compatibility.

Нельзя считать «вернуть предыдущий commit» безопасным, если migration уже
сделала старый Worker несовместимым с D1.

## 117.6. Aggregate repair

После restore/migration where relevant запускается существующий aggregate
verification/repair contract раздела 85.9.

Reads могут быть восстановлены только из backup, потому что raw read
events intentionally не хранятся.

---

<a id="section-118"></a>
# 118. Observability, Privacy & Retention

## 118.1. Minimal observability

Starter не требует Sentry/Datadog/third-party analytics.

Worker использует provider-native structured logs/observability where
available.

Минимальные safe fields:

``` text
timestamp
environment
request/correlation id
logical route
HTTP method
status
duration
safe machine error code
site_id after trusted resolution
```

## 118.2. Forbidden log data

Не логировать по умолчанию:

``` text
Access JWT
Authorization
full visitor cookie/id
Turnstile secret/token
full comment body
full admin payload
raw SQL with user values
raw IP into application persistence
```

Platform transient network/security telemetry не превращается в D1 user
profile.

## 118.3. Correlation

Public error MAY возвращать opaque correlation/request ID.

Он не содержит:

``` text
user identity
secret
database key material
raw exception text
```

## 118.4. Health endpoint

`/health` является unversioned operational endpoint, а не частью public
business `/v1` API.

Минимально он подтверждает Worker process/config availability.

По умолчанию он не раскрывает:

``` text
D1 contents
secrets
internal version history
stack
environment variables
```

Глубокий DB health check, если когда-либо нужен, должен быть private или
очень ограниченным.

## 118.5. Retention

Runtime retention policy принадлежит PROJECT/operations config.

Starter defaults:

``` text
published comments
→ retain while article/runtime record retained

pending
→ retain until moderation + bounded operational cleanup

spam
→ bounded retention then purge allowed

Access/security logs
→ provider/default operational retention, not D1 profile store
```

Точный срок spam/pending может задаваться PROJECT без изменения schema,
но должен быть документирован до production.

Physical purge removed article runtime data является explicit maintenance
operation согласно разделу 112.

---

<a id="section-119"></a>
# 119. Accessibility, Robots, Browser Metadata & HTTP Delivery Baseline

## 119.1. Accessibility target

Normative target public UI:

``` text
WCAG 2.2 AA
```

Это target, а не обещание автоматической сертификации.

Существующие конкретные contracts по:

``` text
semantic HTML
keyboard
focus-visible
touch targets
dialogs
forms/errors
reduced motion
zoom
contrast
screen readers
```

остаются implementation requirements.

Automated accessibility tests не заменяют keyboard/screen-reader/manual
checks representative flows.

## 119.2. Landmarks and navigation

Representative page templates имеют where applicable:

``` text
header
nav
main
footer
one clear H1
skip-to-content
```

Повторяющиеся landmarks получают понятные accessible names.

## 119.3. Form errors

Validation error:

``` text
identified near field
programmatically associated with field
summary/focus strategy where multiple errors make it useful
not color-only
```

Async success/error message доступен assistive technology без
необоснованного focus theft.

## 119.4. `robots.txt`

SEO/build layer генерирует environment-aware `robots.txt`.

Production:

``` text
indexing allowed according to page-level rules
sitemap location published
```

Preview/staging:

``` text
must not accidentally become indexable
→ use noindex/X-Robots-Tag or protected preview access as appropriate
```

`robots.txt` сам по себе не является достаточной защитой preview и не
используется как замена page-level/header `noindex` для URL, который
crawler должен иметь возможность прочитать.

## 119.5. Browser metadata ownership

PROJECT владеет brand assets.

THEME владеет semantic light/dark colors.

Head/SEO renderer собирает:

``` text
favicon set
apple-touch-icon
manifest only if project actually needs one
theme-color light
theme-color dark
```

Для двух color schemes `theme-color` должен соответствовать THEME и
может использовать media condition where supported.

Не добавлять PWA/service worker только ради favicon/theme-color.

## 119.6. HTTP delivery ownership

Compression, ETag/Last-Modified и low-level transfer optimization
принадлежат hosting/CDN/deploy adapter, а не Astro component code.

Where supported, production static text assets должны передаваться с
современным HTTP compression provider'ом.

Fingerprint assets получают cache contract раздела 82.

Codex не должен:

``` text
писать собственный gzip middleware для static shared hosting
создавать application-level compression layer без необходимости
ставить ETag вручную там, где host корректно управляет им
```

## 119.7. Verification

Production HTTP verification проверяет representative resources:

``` text
HTML
hashed CSS/JS
image
robots.txt
sitemap
API mutation
API cached snapshot
404
redirect
```

и подтверждает expected:

``` text
status
content-type
cache semantics
security headers
compression where provider exposes/supports it
```
