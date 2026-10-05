import './zoom.css';

export const zoomControlIds = {
  decrease: 'zoom-decrease',
  increase: 'zoom-increase',
  reset: 'zoom-reset',
  value: 'zoom-value',
};

export function ZoomControls(): string {
  return `<div class="zoom-controls" aria-label="Масштаб поля">
            <button class="zoom-controls__button" id="${zoomControlIds.decrease}" type="button" aria-label="Уменьшить масштаб" title="Уменьшить масштаб">−</button>
            <output class="zoom-controls__value" id="${zoomControlIds.value}" aria-live="polite">100%</output>
            <button class="zoom-controls__button" id="${zoomControlIds.increase}" type="button" aria-label="Увеличить масштаб" title="Увеличить масштаб">+</button>
            <button class="zoom-controls__button zoom-controls__button--reset" id="${zoomControlIds.reset}" type="button" aria-label="Показать поле целиком" title="Показать поле целиком">⌖</button>
          </div>`;
}
