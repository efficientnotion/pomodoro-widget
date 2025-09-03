// ===== 기록 및 차트 함수 =====

// 오늘 날짜(YYYY-MM-DD) 문자열
function getDateStr() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

// 로컬스토리지에서 기록 불러오기
function loadHistory() {
  return JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
}

// 기록 저장
function saveHistory(history) {
  localStorage.setItem('pomodoroHistory', JSON.stringify(history));
}

// 최근 7일 기록을 차트로 그리기
function drawChart() {
  const history = loadHistory();
  const chart = document.querySelector('.chart');
  const labelsDiv = document.querySelector('.chart-labels');
  let bars = [];
  let labels = [];
  let today = new Date();

  for (let i = 6; i >= 0; i--) {
    let d = new Date(today);
    d.setDate(today.getDate() - i);
    let ds = d.toISOString().slice(0, 10);
    let count = history[ds] || 0;
    bars.push(count);
    labels.push(['일','월','화','수','목','금','토'][d.getDay()]);
  }

  chart.innerHTML = '';
  bars.forEach(cnt => {
    // 최대 6회 기준
    let h = Math.min((cnt / 6) * 100, 100);
    chart.innerHTML += `<div class="bar" style="height: ${h}%;"></div>`;
  });
  labelsDiv.innerHTML = labels.map(l => `<span>${l}</span>`).join('');
}

// ===== 포모도로 타이머 기능 =====

let time = 25 * 60; // 25분
let timer;
let isRunning = false;

const timerDisplay = document.querySelector('.timer');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');

// (1단계에서 진행바 원형 추가했으면, 여기서 진행률 갱신)
const progressCircle = document.querySelector('.progress');
const FULL_DASH_ARRAY = 2 * Math.PI * 80;
if (progressCircle) {
  progressCircle.setAttribute('stroke-dasharray', FULL_DASH_ARRAY);
}

function updateDisplay() {
  let min = String(Math.floor(time / 60)).padStart(2, '0');
  let sec = String(time % 60).padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
  // 원형 진행률도 갱신
  if (progressCircle) {
    const progress = (1 - time / (25 * 60)) * FULL_DASH_ARRAY;
    progressCircle.setAttribute('stroke-dashoffset', progress);
  }
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

        // ===== 타이머 완료 시 날짜별 기록 누적 & 차트 갱신 =====
        const history = loadHistory();
        const date = getDateStr();
        history[date] = (history[date] || 0) + 1;
        saveHistory(history);
        drawChart();
        // =======================================================
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

const toggleChartBtn = document.getElementById('toggleChart');
const chartBox = document.querySelector('.chart-box');

toggleChartBtn.onclick = function() {
  chartBox.classList.toggle('active');
};


// ===== 페이지 시작 시 차트 처음 한 번 그리기 =====
drawChart();

