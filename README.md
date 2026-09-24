# Sputnik — a private, local-first planner

Sputnik is a small personal planner that runs entirely in your browser. It combines:

- **Tasks** grouped into categories, which you drag onto the days of a week or month calendar;
- **Monthly payments** (rent, subscriptions, bills) with a "paid" checkbox;
- **Yearly events** (birthdays, holidays, trips) laid out across the 12 months;
- a **Today** page that shows what matters right now.

There is no server, no account and no sign-up. Your data lives in your browser, and you can export or import it as a file whenever you want.

**▶ Try it: [alnkow.github.io/sputnik](https://alnkow.github.io/sputnik/)**. Nothing to install; your data stays in your browser.

> The interface is in **Russian**. This README gives the Russian button names in quotes, e.g. «Создать» (Create), so you can find them.

---

## Table of contents

- [Privacy: where your data lives](#privacy-where-your-data-lives)
- [Getting started](#getting-started)
- [How it works](#how-it-works)
  - [Today](#today--сегодня)
  - [Week and Month calendar](#week-and-month-calendar--неделя--месяц)
  - [Tasks and categories](#tasks-and-categories)
  - [Payments](#payments--платежи)
  - [Events](#events--события)
  - [Completed tasks](#completed-tasks--выполненные)
- [Backup: export and import](#backup-export-and-import)
- [Export to PDF](#export-to-pdf)
- [Tips and caveats](#tips-and-caveats)
- [For developers](#for-developers)

---

## Privacy: where your data lives

- **Everything is stored locally**, in your browser's `localStorage` under the key `task-manager`.
- **Nothing is sent anywhere.** The app has no backend, no analytics, no tracking and no accounts. Your tasks, payments and events never leave your computer unless you export them yourself.
- **No third-party requests at all.** Fonts and icons are bundled with the app, so it doesn't contact any CDN or font service, and it works offline once loaded.
- **Exports are ordinary files on your disk.** Where they go, and who you share them with, is up to you.

Because the data lives in the browser, keep in mind:

| Situation | What happens to your data |
|---|---|
| You close the tab or restart the computer | Kept |
| You open the app in **another browser** or another browser profile | That browser starts empty (it has its own storage) |
| You open the app at **another address or port** (e.g. `localhost:5173` vs `localhost:4173`) | That address starts empty (storage is per address) |
| You use a **private / incognito window** | Lost when the window closes |
| You **clear site data / cookies** for the app's address | **Deleted** |

To move data between browsers or computers, or to keep a safety copy, use **[Export and Import](#backup-export-and-import)**.

---

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) **20 or newer** (includes `npm`)
- A modern browser (Chrome, Edge, Firefox, Safari)

### Run it

```bash
git clone https://github.com/alnkow/sputnik.git
cd sputnik
npm install
npm run dev
```

Open the address the terminal shows (by default **http://localhost:5173**).

### Build a static version

```bash
npm run build     # type-check and build into the dist/ folder
npm run preview   # serve the built version locally (http://localhost:4173)
```

The `dist/` folder is a plain static website. You can put it on any static host (GitHub Pages, Netlify, your own server, etc.). Even when hosted online, **each visitor's data stays in their own browser**. The host never receives it.

### Deploy to GitHub Pages

The repository includes a workflow (`.github/workflows/deploy.yml`) that tests, builds and publishes the app on every push to `main`.

1. Push the repository to GitHub.
2. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` or run the workflow manually from the **Actions** tab.

The app will be available at `https://<your-username>.github.io/<repository-name>/`. Asset paths are relative (`base: './'` in `vite.config.ts`), so any repository name works.

---

## How it works

The header contains:

- **Sputnik logo**: click it to go to the **Today** page.
- **«Неделя» / «Месяц» / «Платежи» / «События»**: Week, Month, Payments, Events.
- **«Создать» (Create)**: adds something new. What it creates depends on the page: a task on the calendar pages, a payment row on Payments, an event on Events. It is hidden on Today.
- **«Выполненные» (Completed)**: the archive of completed tasks.
- **⚙ gear menu**: «Экспорт» (Export), «Экспорт PDF» (Export PDF), «Импорт» (Import).

### Today — «Сегодня»

The app always opens on this page. It shows:

- today's date in large type, with the weekday and month;
- **«Задачи на сегодня»**: tasks scheduled for today, plus payments due today;
- **«В этом месяце»**: all events of the current month. An event that falls on today has a «Сегодня» (Today) badge.

Click any item to open its card, the same way as on the calendar.

### Week and Month calendar — «Неделя» / «Месяц»

- **Week** shows 7 day columns. Past days are narrower. **Month** shows the whole month as a grid.
- Use the arrows and «Сегодня» (Today) to move between weeks or months.
- The task panel on the right lists your tasks by category.

**Scheduling tasks**

- **Drag** a task from the right panel onto a day to schedule it.
- **Drag** a scheduled task to another day to move it.
- **Unschedule** a task in any of three ways:
  - drag it **outside the calendar**, for example back onto the right panel;
  - hover it in the week view and click **×**;
  - open the task and click the calendar-with-cross icon next to the **date** field.
- A task can be on only one day at a time.

**What else appears on the calendar** (read-only, cannot be dragged or removed from here):

- 💵 **Payments**: a green chip on the payment's day every month.
- ⭐ **Events**: a colored chip (a circle in month view) on the event's day, every year, if the event has "Show in calendar" turned on.

If a day doesn't exist in a month, the item moves to the last day of that month. For example, a payment on the 31st shows on 30 April, and one on the 30th shows on 28 February.

### Tasks and categories

- **Create** a task or category with «Создать», or with the «Задача» / «Категория» buttons on the right panel. A task has:
  - a title and an optional description;
  - a category;
  - a color (its own, or inherited from the category);
  - an optional emoji;
  - an optional date.
- **Important**: click the 🔥 flame to mark a task important. The «Только важные» (Only important) switch filters the panel.
- **Reorder** categories and tasks by dragging. Drag a task onto another category to move it there.
- **Collapse** a category by clicking its header.
- **Open** a task to see its card; click «Редактировать» (Edit) to change it, or «Завершить» (Complete) to finish it.
- A category can only be deleted when it is **empty**.

### Payments — «Платежи»

A table of recurring monthly payments with the columns **Name, Amount, Payment date, Notes** and a **paid** checkbox.

- **Add** a payment with «Создать». The new row opens ready for editing.
- **Edit** a row with the ✎ pencil button. Save with the ✓ button or **Enter**; **Esc** cancels your changes.
- **Delete** a row with the 🗑 button. It asks for confirmation.
- **Reorder** rows by dragging the handle on the left.
- **Payment date** is a day of the month (1–31). It repeats every month.
- **Tick the checkbox** when you've paid. It shows «Оплачено» (Paid) and the date you ticked it.
- **«Снять все отметки»** (Clear all ticks) unticks every payment, handy at the start of a new month.
- The footer shows the **total**, the **amount left to pay**, and how many payments are paid.

**On the calendar:** a paid payment is hidden for the month in which you ticked it. In later months it shows up again as due, until you tick it again.

### Events — «События»

Twelve cells, one for each month. Each cell lists that month's events.

- **Create** an event with «Создать». It has a title, a description, a month, a color and an icon.
- **«Отображать в календаре»** (Show in calendar): turn it on and pick a day. The event then appears on the calendar on that date **every year**.
- **Click** an event to open its card. From the card you can **Edit** it; in edit mode you can **Delete** it (with confirmation).
- An event opened **from the calendar** or from Today is view-only.

### Completed tasks — «Выполненные»

Completing a task removes it from the panel and the calendar and moves it to this archive. From there you can **restore** a task or **delete it permanently** (with confirmation).

---

## Backup: export and import

Open the **⚙ gear menu** in the top-right corner.

### Export — «Экспорт»

- Downloads **all your data** as a single JSON file, named like `sputnik-2026-09-25.json`. The file includes categories, tasks (active and completed), payments, events and view settings.
- The file goes to your browser's **downloads folder**, usually `~/Downloads`. You can change this in the browser's settings.
- It is a plain, human-readable text file. **It is not encrypted**, so keep it somewhere safe if your data is sensitive.

### Import — «Импорт»

- Choose a previously exported `.json` file.
- The app checks the file and asks for confirmation, showing how many categories, tasks, payments and events it contains.
- Importing **replaces everything** currently in the app. It does not merge. Export first if you want to keep your current data.
- Backups made by older versions of the app still import fine, even if they have no payments or events.

**Moving to another computer or browser:** export on the old one → copy the file → import on the new one.

---

## Export to PDF

**⚙ → «Экспорт PDF»** opens your browser's print dialog with a clean, printable report of everything:

1. **Tasks**: grouped by category, with dates, descriptions and the 🔥 mark (empty categories are skipped);
2. **Completed tasks**: with category and completion date;
3. **Payments**: a table with amount, day, notes and paid status, plus totals;
4. **Events**: grouped by month, with their calendar day and description.

To get a PDF file, choose **"Save as PDF"** as the printer in the dialog. The file name defaults to `Sputnik — <date>`. You can also send the report to a real printer. The PDF is created by your browser on your computer and is not uploaded anywhere.

---

## Tips and caveats

- **Export regularly.** Browser storage is reliable, but clearing site data, reinstalling the browser or switching computers will leave you with an empty planner. A JSON export is your backup.
- **Storage size:** browsers give each site about 5 MB of local storage. That is thousands of tasks, far more than a personal planner needs.
- **The day is based on your computer's clock and time zone.** If the app stays open past midnight, reload the page to refresh the Today view.

---

## For developers

**Stack:**
- React 19, TypeScript (strict), Vite, Tailwind CSS v4;
- Zustand with `persist` for state;
- dnd-kit for drag and drop;
- Jest and React Testing Library for tests.

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Run the test suite |
| `npm run lint` | Run ESLint |

**Architecture:** [Feature-Sliced Design](https://feature-sliced.design/). The layers are `app → pages → widgets → features → entities → shared`, and imports only go downward. `@/` is an alias for `src/`.

```
src/
  app/        app shell, page switching, global styles
  pages/      today, home (week/month), payments, events
  widgets/    calendar board, task sidebar, payments table, events board, print report, …
  features/   drag and drop, task/event dialogs, export/import
  entities/   task, category, payment, event: selectors and small UI pieces
  shared/     store, types, date/money helpers, UI kit
```

**Data format:** the export file is the persisted state: `{ version, categories, tasks, payments, events, ui }`. Import validates and normalizes every field (see `src/features/export-import/lib/io.ts`), so a hand-edited or partially broken file can't corrupt the app.
