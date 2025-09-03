// ===== DOM 요소 선택 =====
const timerDisplay = document.querySelector('.timer');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const progressCircle = document.querySelector('.progress');
const toggleChartBtn = document.getElementById('toggleChart');
const chartBox = document.querySelector('.chart-box');

// ===== 타이머 변수 =====
const WORK_MINUTES = 25;
let totalTime = WORK_MINUTES * 60;
let time = totalTime;
let timer;
let isRunning = false;
const FULL_DASH_ARRAY = 2 * Math.PI * 80;

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

// 차트 그리기 함수 - 날짜 표시
function drawChart() {
  const history = loadHistory();
  const chart = document.querySelector('.chart');
  const labelsDiv = document.querySelector('.chart-labels');
  
  // 차트와 라벨 초기화
  chart.innerHTML = '';
  labelsDiv.innerHTML = '';
  
  let recentData = [];
  const today = new Date();
  
  // 최근 7일치 데이터 수집
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateString = getDateStr(d);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const displayDate = `${month}/${day}`;
    
    recentData.push({
      label: displayDate,
      count: history[dateString] || 0,
      isToday: i === 0
    });
  }

  const maxCount = Math.max(...recentData.map(d => d.count), 1);

  // 차트 막대와 라벨 생성
  recentData.forEach(data => {
    // 막대 생성
    const height = (data.count / maxCount) * 100;
    const barDiv = document.createElement('div');
    barDiv.className = 'bar';
    barDiv.style.height = `${height}%`;
    
    if (data.isToday) {
      barDiv.style.background = '#2563eb';
    }
    
    barDiv.title = `${data.label}: ${data.count}회`;
    chart.appendChild(barDiv);
    
    // 라벨 생성
    const labelSpan = document.createElement('span');
    labelSpan.textContent = data.label;
    labelSpan.style.fontWeight = data.isToday ? 'bold' : 'normal';
    labelSpan.style.fontSize = '0.85rem';
    labelsDiv.appendChild(labelSpan);
  });
}

// ===== 타이머 기능 함수 =====
function updateDisplay() {
  let min = String(Math.floor(time / 60)).padStart(2, '0');
  let sec = String(time % 60).padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
  
  // 진행률 계산: 시간이 지날수록 원이 채워짐
  const timeElapsed = totalTime - time;
  const progressRatio = timeElapsed / totalTime;
  const progressOffset = FULL_DASH_ARRAY * (1 - progressRatio);
  
  progressCircle.style.strokeDashoffset = progressOffset;
}

// 시작/일시정지 버튼
startBtn.onclick = function() {
  if (isRunning) {
    isRunning = false;
    startBtn.innerHTML = '&#9658;';
    clearInterval(timer);
  } else {
    isRunning = true;
    startBtn.innerHTML = '&#10074;&#10074;';
    timer = setInterval(() => {
      if (time > 0) {
        time--;
        updateDisplay();
      } else {
        clearInterval(timer);
        isRunning = false;
        startBtn.innerHTML = '&#9658;';

        // 타이머 완료 시 기록 누적
        const history = loadHistory();
        const todayStr = getDateStr(new Date());
        history[todayStr] = (history[todayStr] || 0) + 1;
        saveHistory(history);
        
        // 차트가 보이는 상태라면 즉시 업데이트
        if (chartBox.classList.contains('active')) {
          drawChart();
        }
        
        alert('포모도로 1회를 완료했습니다!');
        resetTimer();
      }
    }, 1000);
  }
};

// 리셋 기능
function resetTimer() {
  isRunning = false;
  clearInterval(timer);
  time = totalTime;
  updateDisplay();
  startBtn.innerHTML = '&#9658;';
}

resetBtn.onclick = resetTimer;

// 차트 보이기/숨기기 토글
toggleChartBtn.onclick = function() {
  chartBox.classList.toggle('active');
  if (chartBox.classList.contains('active')) {
    drawChart();
  }
};

// ===== 페이지 시작 시 초기화 =====
progressCircle.style.strokeDasharray = FULL_DASH_ARRAY;
progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY;
updateDisplay();
