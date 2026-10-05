import type { PointDirection } from '../types.ts';

interface DirectionButton {
  button: HTMLButtonElement;
  direction: PointDirection;
}

function isInteractiveElement(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function setupArrows({
  top,
  left,
  bottom,
  right,
  drawPoint,
}: {
  top: HTMLButtonElement;
  left: HTMLButtonElement;
  bottom: HTMLButtonElement;
  right: HTMLButtonElement;
  drawPoint: (direction: PointDirection) => void;
}) {
  const keyMap: Partial<Record<string, PointDirection>> = {
    ArrowUp: 'top',
    ArrowRight: 'right',
    ArrowDown: 'bottom',
    ArrowLeft: 'left',
  };

  document.addEventListener('keydown', event => {
    const direction = keyMap[event.key];

    if (!direction || event.repeat || isInteractiveElement(event.target)) return;

    event.preventDefault();
    drawPoint(direction);
  });

  const buttons: DirectionButton[] = [
    { button: top, direction: 'top' },
    { button: right, direction: 'right' },
    { button: bottom, direction: 'bottom' },
    { button: left, direction: 'left' },
  ];

  buttons.forEach(({ button, direction }) => {
    button.addEventListener('click', () => drawPoint(direction));

    button.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button === 0) {
        button.classList.add('game__button--active');
      }
    });

    const removeActiveState = () => button.classList.remove('game__button--active');
    button.addEventListener('pointerup', removeActiveState);
    button.addEventListener('pointercancel', removeActiveState);
    button.addEventListener('pointerleave', removeActiveState);
  });
}
