import './timer.css';

export function Timer() {
  return `<div class="timer">
            <div class="timer__container">
              <div>Текущее время</div>
              <div>00:00</div>
            </div>
            
            <div class="timer__container">
              <div>Старое время</div>
              <div>00:00</div>
            </div>
          </div>`;
}
