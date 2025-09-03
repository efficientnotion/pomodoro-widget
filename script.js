let time = 25 * 60; // 25분
let timer;
let isRunning = false;

const timerDisplay = document.querySelector('.timer');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');

function updateDisplay() {
  let min = String(Math.floor(time / 60)).padStart(2, '0');
  let sec = String(time % 60).padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
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
