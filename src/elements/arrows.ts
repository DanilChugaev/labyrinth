import type { PointDirection } from '../types.ts';

interface KeyMapObj {
  button?: HTMLButtonElement;
  direction?: PointDirection;
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
  const arrowUp: KeyMapObj = {
    button: top,
    direction: 'top',
  };
  const arrowRight: KeyMapObj = {
    button: right,
    direction: 'right',
  };
  const arrowDown: KeyMapObj = {
    button: bottom,
    direction: 'bottom',
  };
  const arrowLeft: KeyMapObj = {
    button: left,
    direction: 'left',
  };

  const keyMap: Record<string, KeyMapObj> = {
    ArrowUp: arrowUp,
    ArrowRight: arrowRight,
    ArrowDown: arrowDown,
    ArrowLeft: arrowLeft,
  };

  document.addEventListener('keydown', event => {
    const keyMapObj: KeyMapObj = keyMap[event.key];

    if (keyMapObj?.button && !event.repeat && keyMapObj?.direction) {
      event.preventDefault();
      drawPoint(keyMapObj.direction);
    }
  });

  const buttons = [arrowUp, arrowRight, arrowDown, arrowLeft];

  buttons.forEach(({ button, direction }) => {
    // для мыши
    button!.addEventListener('mousedown', () => drawPoint(direction!));

    // для сенсорных устройств
    button!.addEventListener('touchstart', event => {
      event.preventDefault();
      button!.classList.add('game__button--active');
      drawPoint(direction!);
    });
    button!.addEventListener('touchend', () => {
      button!.classList.remove('game__button--active');
    });
    button!.addEventListener('touchcancel', () => {
      button!.classList.remove('game__button--active');
    });
  });
}
