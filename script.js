// ===== DOM 요소 선택 =====
const timerDisplay = document.querySelector('.timer');
const statusDisplay = document.querySelector('.status');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const skipBtn = document.getElementById('skip');
const progressCircle = document.querySelector('.progress');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeBtn = document.querySelector('.close-btn');
const saveBtn = document.getElementById('saveSettings');
const chartBox = document.querySelector('.chart-box');
const showChartCheckbox = document.getElementById('showChart');

// ===== 타이머 설정 =====
let settings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  showChart: false
};

// 설정 불러오기
function loadSettings() {
  const saved = localStorage.getItem('pomodoroSettings');
  if (saved) {
    settings = JSON.parse(saved);
    document.getElementById('workTime').value = settings.work;
    document.getElementById('shortBreak').value = settings.shortBreak;
    document.getElementById('longBreak').value = settings.longBreak;
    document.getElementById('showChart').checked = settings.showChart;
    if (settings.showChart) {
      chartBox.classList.add('active');
      drawChart();
    }
  }
}

// ===== 세션 관리 =====
const SESSION_TYPE = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

let currentSession = SESSION_TYPE.WORK;
let sessionCount = 0;
let totalTime;
let time;
let timer;
let isRunning = false;
const FULL_DASH_ARRAY = 2 * Math.PI * 80;

// 세션 초기화
function initSession(sessionType) {
  currentSession = sessionType;
  
  switch(sessionType) {
    case SESSION_TYPE.WORK:
      totalTime = settings.work * 60;
      statusDisplay.textContent = '● Work';
      statusDisplay.className = 'status';
      progressCircle.className = 'progress';
      break;
    case SESSION_TYPE.SHORT_BREAK:
      totalTime = settings.shortBreak * 60;
      statusDisplay.textContent = '● Short Break';
      statusDisplay.className = 'status break';
      progressCircle.className = 'progress break';
      break;
    case SESSION_TYPE.LONG_BREAK:
      totalTime = settings.longBreak * 60;
      statusDisplay.textContent = '● Long Break';
      statusDisplay.className = 'status long-break';
      progressCircle.className = 'progress long-break';
      break;
  }
  
  time = totalTime;
  updateDisplay();
}

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

function getThisMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function drawChart() {
  const history = loadHistory();
  const chart = document.querySelector('.chart');
  const labelsDiv = document.querySelector('.chart-labels');
  
  chart.innerHTML = '';
  labelsDiv.innerHTML = '';
  
  const today = new Date();
  const monday = getThisMonday(today);
  
  let maxCount = 1;
  const weekData = [];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateString = getDateStr(d);
    const count = history[dateString] || 0;
    maxCount = Math.max(maxCount, count);
    
    weekData.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      count: count,
      isToday: d.toDateString() === today.toDateString(),
      isFuture: d > today
    });
  }
  
  weekData.forEach(data => {
    const barDiv = document.createElement('div');
    barDiv.className = 'bar';
    barDiv.style.height = `${(data.count / maxCount) * 100}%`;
    
    if (data.isToday) {
      barDiv.style.background = '#2563eb';
    } else if (data.isFuture) {
      barDiv.style.background = '#ddd';
    }
    
    barDiv.title = `${data.date}: ${data.count} sessions`;
    chart.appendChild(barDiv);
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = data.date;
    labelSpan.style.fontWeight = data.isToday ? 'bold' : 'normal';
    labelSpan.style.color = data.isToday ? '#2563eb' : '#888';
    labelsDiv.appendChild(labelSpan);
  });
}

// ===== 타이머 기능 =====
function updateDisplay() {
  let min = String(Math.floor(time / 60)).padStart(2, '0');
  let sec = String(time % 60).padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
  
  const timeElapsed = totalTime - time;
  const progressRatio = timeElapsed / totalTime;
  const progressOffset = FULL_DASH_ARRAY * (1 - progressRatio);
  progressCircle.style.strokeDashoffset = progressOffset;
}

function completeSession() {
  isRunning = false;
  clearInterval(timer);
  startBtn.innerHTML = '&#9658;';
  
  if (currentSession === SESSION_TYPE.WORK) {
    sessionCount++;
    
    // Work 세션만 기록
    const history = loadHistory();
    const todayStr = getDateStr(new Date());
    history[todayStr] = (history[todayStr] || 0) + 1;
    saveHistory(history);
    
    if (chartBox.classList.contains('active')) {
      drawChart();
    }
    
    // 4번째 Work 후에는 Long Break
    if (sessionCount % 4 === 0) {
      initSession(SESSION_TYPE.LONG_BREAK);
    } else {
      initSession(SESSION_TYPE.SHORT_BREAK);
    }
  } else {
    // Break 후에는 다시 Work
    initSession(SESSION_TYPE.WORK);
  }
  
  // 알림
  const notification = currentSession === SESSION_TYPE.WORK ? 
    'Time for work!' : 'Time for a break!';
  alert(notification);
}

// 시작/일시정지
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
        completeSession();
      }
    }, 1000);
  }
};

// 리셋
function resetTimer() {
  isRunning = false;
  clearInterval(timer);
  time = totalTime;
  updateDisplay();
  startBtn.innerHTML = '&#9658;';
}
resetBtn.onclick = resetTimer;

// 스킵 (다음 세션으로)
skipBtn.onclick = function() {
  if (confirm('Skip to next session?')) {
    completeSession();
  }
};

// ===== 설정 모달 =====
settingsBtn.onclick = function() {
  settingsModal.classList.add('show');
};

closeBtn.onclick = function() {
  settingsModal.classList.remove('show');
};

saveBtn.onclick = function() {
  settings.work = parseInt(document.getElementById('workTime').value);
  settings.shortBreak = parseInt(document.getElementById('shortBreak').value);
  settings.longBreak = parseInt(document.getElementById('longBreak').value);
  settings.showChart = document.getElementById('showChart').checked;
  
  localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  
  if (settings.showChart) {
    chartBox.classList.add('active');
    drawChart();
  } else {
    chartBox.classList.remove('active');
  }
  
  // 현재 세션 재초기화
  initSession(currentSession);
  resetTimer();
  
  settingsModal.classList.remove('show');
};

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
  if (event.target === settingsModal) {
    settingsModal.classList.remove('show');
  }
};

// ===== 초기화 =====
loadSettings();
initSession(SESSION_TYPE.WORK);
progressCircle.style.strokeDasharray = FULL_DASH_ARRAY;
progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY;
