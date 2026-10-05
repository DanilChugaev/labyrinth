import './logo.css';
import labyrinth from '/labyrinth.svg';

export function Logo() {
  return `<div class="logo">
            <img class="logo__img" src="${labyrinth}" alt="Labyrinth icon" width="50">
            <h1 class="logo__title">Labyrinth<sup class="logo__version" aria-label="version ${__APP_VERSION__}">v${__APP_VERSION__}</sup></h1>
          </div>`;
}
