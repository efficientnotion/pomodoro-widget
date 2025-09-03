// ===== DOM 요소 선택 =====
const timerDisplay = document.querySelector('.timer');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const progressCircle = document.querySelector('.progress');
const toggleChartBtn = document.getElementById('toggleChart');
const chartBox = document.querySelector('.chart-box');

// ===== 타이머 변수 =====
const WORK_MINUTES = 25;
let time = WORK_MINUTES * 60;
let timer;
let isRunning = false;
const FULL_DASH_ARRAY = 2 * Math.PI * 80; // 원의 둘레 (2 * PI * 반지름)

// ===== 기록 및 차트 함수 =====
function getDateStr(date) {
  return date.toISOString().slice(0, 10);
}
function loadHistory() {
  return JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
}
function saveHistory(history) {
  localStorage.setItem('pomodoroHistory', JSON.stringify(history));
}

// 차트 그리기 함수 (수정됨)
function drawChart() {
  const history = loadHistory();
  const chart = document.querySelector('.chart');
  const labelsDiv = document.querySelector('.chart-labels');
  
  let recentData = [];
  const today = new Date();
  
  // 1. 최근 7일치 데이터 수집
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateString = getDateStr(d);
    recentData.push({
      label: ['일','월','화','수','목','금','토'][d.getDay()],
      count: history[dateString] || 0
    });
  }

  // 2. 요청사항: '오름차순'으로 정렬 (횟수 기준)
  recentData.sort((a, b) => a.count - b.count);

  const maxCount = Math.max(...recentData.map(d => d.count), 1); // 0으로 나누는 것 방지

  // 3. 차트와 라벨 HTML 생성
  chart.innerHTML = '';
  labelsDiv.innerHTML = '';
  
  recentData.forEach(data => {
    const height = (data.count / maxCount) * 100;
    chart.innerHTML += `<div class="bar" style="height: ${height}%;"></div>`;
    labelsDiv.innerHTML += `<span>${data.label}</span>`;
  });
}

// ===== 타이머 기능 함수 =====

// 시간 표시 및 원형 바 업데이트 (수정됨)
function updateDisplay() {
  let min = String(Math.floor(time / 60)).padStart(2, '0');
  let sec = String(time % 60).padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
  
  // 진행률 계산 수정 (시간이 줄수록 progress 값이 0에 가까워짐)
  const timeLeftRatio = time / (WORK_MINUTES * 60);
  const progressOffset = FULL_DASH_ARRAY * timeLeftRatio;
  progressCircle.style.strokeDashoffset = progressOffset;
}

// 시작/일시정지 버튼
startBtn.onclick = function() {
  if (isRunning) {
    isRunning = false;
    startBtn.innerHTML = '&#9658;'; // 재생 아이콘
    clearInterval(timer);
  } else {
    isRunning = true;
    startBtn.innerHTML = '&#10074;&#10074;'; // 일시정지 아이콘
    timer = setInterval(() => {
      if (time > 0) {
        time--;
        updateDisplay();
      } else {
        clearInterval(timer);
        isRunning = false;
        startBtn.innerHTML = '&#9658;';

        // 타이머 완료 시 기록 누적 및 차트 갱신
        const history = loadHistory();
        const todayStr = getDateStr(new Date());
        history[todayStr] = (history[todayStr] || 0) + 1;
        saveHistory(history);
        drawChart();
        alert('포모도로 1회를 완료했습니다!');
        resetTimer(); // 완료 후 리셋
      }
    }, 1000);
  }
};

// 리셋 기능
function resetTimer() {
  isRunning = false;
  clearInterval(timer);
  time = WORK_MINUTES * 60;
  updateDisplay();
  startBtn.innerHTML = '&#9658;';
}
resetBtn.onclick = resetTimer;

// 차트 보이기/숨기기 토글
toggleChartBtn.onclick = function() {
  chartBox.classList.toggle('active');
};

// ===== 페이지 시작 시 초기화 =====
updateDisplay();
drawChart();
