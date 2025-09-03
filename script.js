let time = 25 * 60; // 25분
let timer;
let isRunning = false;

const timerDisplay = document.querySelector('.timer');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');

// 진행바를 위한 코드 추가
const progressCircle = document.querySelector('.progress');
const FULL_DASH_ARRAY = 2 * Math.PI * 80; // 80은 svg에서 r값(반지름)
progressCircle.setAttribute('stroke-dasharray', FULL_DASH_ARRAY);

function updateDisplay() {
  // 시계 표시
  let min = String(Math.floor(time / 60)).padStart(2, '0');
  let sec = String(time % 60).padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
  // 원형 진행바 표시
  const progress = (1 - time / (25 * 60)) * FULL_DASH_ARRAY;
  progressCircle.setAttribute('stroke-dashoffset', progress);
}
updateDisplay();

startBtn.onclick = function() {
  if (!isRunning) {
    isRunning = true;
    startBtn.innerHTML = '||';
    timer = setInterval(() => {
      if (time > 0) {
        time--;
        updateDisplay();
      } else {
        clearInterval(timer);
        isRunning = false;
        startBtn.innerHTML = '▶';
        updateDisplay(); // 0 표시, 진행바도 채워진걸로 표시
      }
    }, 1000);
  } else {
    isRunning = false;
    startBtn.innerHTML = '▶';
    clearInterval(timer);
  }
};

resetBtn.onclick = function() {
  isRunning = false;
  clearInterval(timer);
  time = 25 * 60;
  updateDisplay();
  startBtn.innerHTML = '▶';
};
