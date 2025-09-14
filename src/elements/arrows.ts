export function setupArrows({
  top,
  left,
  bottom,
  right,
}: {
  top: HTMLButtonElement;
  left: HTMLButtonElement;
  bottom: HTMLButtonElement;
  right: HTMLButtonElement;
}) {
  const keyMap: Record<string, HTMLButtonElement> = {
    ArrowUp: top,
    ArrowLeft: left,
    ArrowDown: bottom,
    ArrowRight: right,
  };

  document.addEventListener('keydown', event => {
    const button: HTMLButtonElement | undefined = keyMap[event.key];

    if (button && !event.repeat) {
      button.classList.add('game__button--active');
    }
  });

  document.addEventListener('keyup', event => {
    const button: HTMLButtonElement | undefined = keyMap[event.key];

    if (button) {
      button.classList.remove('game__button--active');
    }
  });

  const buttons = [top, left, bottom, right];
  buttons.forEach(button => {
    // для мыши
    button.addEventListener('mousedown', () => {});
    button.addEventListener('mouseup', () => {});
    button.addEventListener('mouseleave', () => {});

    // для сенсорных устройств
    button.addEventListener('touchstart', event => {
      event.preventDefault();
      button.classList.add('game__button--active');
    });
    button.addEventListener('touchend', () => {
      button.classList.remove('game__button--active');
    });
    button.addEventListener('touchcancel', () => {
      button.classList.remove('game__button--active');
    });
  });
}
