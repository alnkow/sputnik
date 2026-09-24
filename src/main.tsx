import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
// Шрифт логотипа — локально, без запросов к Google Fonts (нужна только латиница).
import '@fontsource/yesteryear/latin-400.css';
import '@/app/styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Не найден корневой элемент #root');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
