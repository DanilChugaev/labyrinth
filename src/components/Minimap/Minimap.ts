import './minimap.css';

export const minimapIds = {
  canvas: 'minimap',
  container: 'minimap-container',
  toggle: 'minimap-toggle',
};

export function Minimap(): string {
  return `<div class="minimap" id="${minimapIds.container}" hidden>
            <canvas id="${minimapIds.canvas}" class="minimap__canvas" tabindex="0" aria-label="Миникарта лабиринта. Нажмите или перетащите, чтобы изменить вид игрового поля."></canvas>
          </div>`;
}

export function MinimapToggle(): string {
  return `<button class="minimap-toggle" id="${minimapIds.toggle}" type="button" aria-pressed="true" aria-label="Скрыть миникарту" title="Показать или скрыть миникарту">◫</button>`;
}
