import './timer.css';
import { loadBooleanStorageValue } from '../../utils/storage.ts';
import { TIMER_KEY } from '../../constants.ts';

export function Timer({
  timerContainerId,
  currentTimeId,
  oldTimeId,
}: {
  timerContainerId: string;
  currentTimeId: string;
  oldTimeId: string;
}) {
  const isView = loadBooleanStorageValue(TIMER_KEY, true);
  const style = isView ? 'display: flex' : 'display: none';

  return `<div id="${timerContainerId}" style="${style}" class="timer">
            <div class="timer__container">
              <div>Текущее время</div>
              <div id="${currentTimeId}">00:00</div>
            </div>
            
            <div class="timer__container">
              <div>Старое время</div>
              <div id="${oldTimeId}">00:00</div>
            </div>
          </div>`;
}
