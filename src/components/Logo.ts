import '../styles/logo.css';
import labyrinth from '/labyrinth.svg';

export function Logo() {
  return `<div class="logo">
            <img class="logo__img" src="${labyrinth}" alt="Labyrinth icon" width="50">
            <h1 class="logo__title">Labyrinth</h1>
          </div>`;
}
