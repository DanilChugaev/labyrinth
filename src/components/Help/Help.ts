import './help.css';

export const helpIds = {
  button: 'help-button',
  dialog: 'help-dialog',
  close: 'help-close',
};

export function Help(): string {
  return `<button class="help-button" id="${helpIds.button}" type="button" aria-haspopup="dialog" aria-controls="${helpIds.dialog}" aria-label="Открыть справку" title="Справка и горячие клавиши">?</button>
          <dialog class="help-dialog" id="${helpIds.dialog}" aria-labelledby="help-title">
            <div class="help-dialog__header">
              <h2 class="help-dialog__title" id="help-title">Управление</h2>
              <button class="help-dialog__close" id="${helpIds.close}" type="button" aria-label="Закрыть справку">×</button>
            </div>
            <dl class="help-dialog__list">
              <div><dt><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd><kbd>←</kbd></dt><dd>Перемещение по лабиринту</dd></div>
              <div><dt><kbd>+</kbd><kbd>−</kbd></dt><dd>Масштабировать поле</dd></div>
              <div><dt><kbd>0</kbd></dt><dd>Показать поле целиком</dd></div>
              <div><dt><kbd>R</kbd></dt><dd>Новый лабиринт</dd></div>
              <div><dt><kbd>M</kbd></dt><dd>Показать или скрыть миникарту</dd></div>
              <div><dt><kbd>?</kbd></dt><dd>Открыть справку</dd></div>
              <div><dt><kbd>Esc</kbd></dt><dd>Закрыть открытое окно</dd></div>
            </dl>
            <p class="help-dialog__note">На сенсорных устройствах перемещайте поле одним пальцем, а масштабируйте жестом двумя пальцами.</p>
          </dialog>`;
}

export function setupHelp(): { open: () => void } {
  const button = document.querySelector<HTMLButtonElement>(`#${helpIds.button}`)!;
  const dialog = document.querySelector<HTMLDialogElement>(`#${helpIds.dialog}`)!;
  const closeButton = document.querySelector<HTMLButtonElement>(`#${helpIds.close}`)!;

  function open(): void {
    if (!dialog.open) dialog.showModal();
  }

  button.addEventListener('click', open);
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => button.focus());

  return { open };
}
