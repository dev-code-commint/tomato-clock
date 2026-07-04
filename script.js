// 计时器变量
let timer = null;
let timeLeft = 25 * 60; // 默认25分钟（秒）
let isRunning = false;
let currentMode = 'pomodoro'; // 'pomodoro' 或 'break' 或 'longBreak'

// 时间设置（分钟）
const pomodoroTime = 25;
const breakTime = 5;
const longBreakTime = 15;

// 统计数据
let todayCompleted = 0;
let totalCompleted = 0;

// DOM元素
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const todayCompletedEl = document.getElementById('todayCompleted');
const totalCompletedEl = document.getElementById('totalCompleted');

// 格式化时间显示
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新显示
function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    document.title = `${formatTime(timeLeft)} - 番茄钟`;
}

// 更新统计显示
function updateStats() {
    todayCompletedEl.textContent = todayCompleted;
    totalCompletedEl.textContent = totalCompleted;
    // 保存统计数据
    localStorage.setItem('todayCompleted', todayCompleted);
    localStorage.setItem('totalCompleted', totalCompleted);
}

// 加载统计数据
function loadStats() {
    const savedToday = localStorage.getItem('todayCompleted');
    const savedTotal = localStorage.getItem('totalCompleted');

    if (savedToday) todayCompleted = parseInt(savedToday, 10);
    if (savedTotal) totalCompleted = parseInt(savedTotal, 10);

    // 检查今天是否是新的一天
    const lastDate = localStorage.getItem('lastDate');
    const today = new Date().toDateString();

    if (lastDate !== today) {
        // 新的一天，重置今日统计
        todayCompleted = 0;
        localStorage.setItem('todayCompleted', '0');
        localStorage.setItem('lastDate', today);
    }

    updateStats();
}

// 记录番茄完成
function recordPomodoro() {
    if (currentMode === 'pomodoro') {
        todayCompleted++;
        totalCompleted++;
        updateStats();
    }
}

// 切换计时器状态
function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// 开始计时
function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startBtn.textContent = '暂停';

    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;
            startBtn.textContent = '开始';
            // 到达时间后播放提示音
            playNotification();
            // 如果是专注模式，记录完成数
            if (currentMode === 'pomodoro') {
                recordPomodoro();
            }
        }
    }, 1000);
}

// 暂停计时
function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = '开始';
}

// 重置计时器
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = '开始';

    // 根据当前模式设置时间
    switch (currentMode) {
        case 'pomodoro':
            timeLeft = pomodoroTime * 60;
            break;
        case 'break':
            timeLeft = breakTime * 60;
            break;
        case 'longBreak':
            timeLeft = longBreakTime * 60;
            break;
    }

    updateDisplay();
}

// 更新自定义时间
function updateCustomTime() {
    const pomodoroInput = document.getElementById('pomodoroTime');
    const breakInput = document.getElementById('breakTime');
    const longBreakInput = document.getElementById('longBreakTime');

    pomodoroTime = parseInt(pomodoroInput.value) || 25;
    breakTime = parseInt(breakInput.value) || 5;
    longBreakTime = parseInt(longBreakInput.value) || 15;

    // 保存到localStorage
    localStorage.setItem('pomodoroTime', pomodoroTime);
    localStorage.setItem('breakTime', breakTime);
    localStorage.setItem('longBreakTime', longBreakTime);

    // 如果计时器未运行，更新当前时间显示
    if (!isRunning) {
        resetTimer();
    }
}

// 切换模式
function switchMode(mode) {
    currentMode = mode;

    // 更新按钮状态
    document.getElementById('pomodoroBtn').classList.toggle('active', mode === 'pomodoro');
    document.getElementById('breakBtn').classList.toggle('active', mode === 'break');
    document.getElementById('longBreakBtn').classList.toggle('active', mode === 'longBreak');

    // 重置计时器
    resetTimer();
}

// 切换深色模式
function toggleTheme() {
    body.classList.toggle('dark');
    body.classList.toggle('light');

    // 更新按钮图标
    if (body.classList.contains('dark')) {
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }

    // 保存到localStorage
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
}

// 播放提示音（使用Web Audio API）
function playNotification() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('无法播放提示音');
    }
}

// 初始化
function init() {
    // 加载保存的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        themeToggle.textContent = '☀️';
    } else {
        body.classList.add('light');
    }

    // 加载自定义时间设置
    const savedPomodoro = localStorage.getItem('pomodoroTime');
    const savedBreak = localStorage.getItem('breakTime');
    const savedLongBreak = localStorage.getItem('longBreakTime');

    if (savedPomodoro) document.getElementById('pomodoroTime').value = savedPomodoro;
    if (savedBreak) document.getElementById('breakTime').value = savedBreak;
    if (savedLongBreak) document.getElementById('longBreakTime').value = savedLongBreak;

    // 更新默认值
    if (savedPomodoro) pomodoroTime = parseInt(savedPomodoro, 10);
    if (savedBreak) breakTime = parseInt(savedBreak, 10);
    if (savedLongBreak) longBreakTime = parseInt(savedLongBreak, 10);

    // 加载统计数据
    loadStats();

    updateDisplay();
}

// 页面加载时初始化
init();
