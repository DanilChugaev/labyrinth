export function Preloader({ id, color }: { id: string; color: string }) {
  return `<svg id="${id}" class="game__preloader" width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="125.6 125.6">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>`;
}
