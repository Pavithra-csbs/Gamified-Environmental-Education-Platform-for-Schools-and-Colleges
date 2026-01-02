// App State
const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    currentScreen: 'login-section',
    subjects: [],
    topics: [],
    currentTopic: null,
    quizQuestions: [],
    currentQuestionIndex: 0,
    score: 0
};

// UI Elements
const screens = ['login-section', 'subject-section', 'map-section', 'quiz-section'];

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    if (state.token) {
        showScreen('subject-section');
        loadSubjects();
    }

    // Global Back Button Logic
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.onclick = () => {
            if (state.currentScreen === 'map-section') showScreen('subject-section');
            else if (state.currentScreen === 'subject-section') logout();
            else if (state.currentScreen === 'quiz-section') showScreen('map-section');
            else if (state.currentScreen === 'leaderboard-section') showScreen('map-section');
            else if (state.currentScreen === 'profile-section') showScreen('map-section');
            else if (state.currentScreen === 'feedback-section') showScreen('profile-section');
            else if (state.currentScreen === 'about-section') showScreen('profile-section');
            else if (state.currentScreen === 'puzzle-section') showScreen('map-section');
            else if (state.currentScreen === 'teacher-section') logout();
        }
    });
});

function showScreen(screenId) {
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    state.currentScreen = screenId;
}

// Auth Logic
document.getElementById('send-otp-btn').addEventListener('click', async () => {
    const name = document.getElementById('student-name').value;
    const studentClass = document.getElementById('student-class').value;
    const email = document.getElementById('student-email').value;
    const role = document.getElementById('user-role').value;

    if (!name || !studentClass || !email) return showMsg('Please fill all fields', 'error');

    showMsg('Sending OTP...', 'info');
    const res = await api.post('/auth/send-otp', { name, class: studentClass, email, role });

    if (res.message.includes('sent')) {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('otp-form').classList.remove('hidden');
        showMsg('Check console for OTP (Demo)', 'success');
    } else showMsg(res.message, 'error');
});

document.getElementById('verify-otp-btn').addEventListener('click', async () => {
    const email = document.getElementById('student-email').value;
    const otp = document.getElementById('otp-code').value;

    showMsg('Verifying...', 'info');
    const res = await api.post('/auth/verify-otp', { email, otp });

    if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        state.token = res.token;
        state.user = res.user;

        if (state.user.role === 'teacher') loadTeacherDashboard();
        else {
            showScreen('subject-section');
            loadSubjects();
        }
    } else showMsg(res.message, 'error');
});

// Content Logic
async function loadSubjects() {
    const subjects = await api.get(`/content/subjects/${state.user.class}`);
    const list = document.getElementById('subject-list');
    list.innerHTML = '';

    subjects.forEach(sub => {
        const card = document.createElement('div');
        card.className = 'subject-card bounce-in';
        card.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/3075/3075314.png" alt="${sub}">
            <h3>${sub}</h3>
        `;
        card.onclick = () => loadMap(sub);
        list.appendChild(card);
    });
}

async function loadMap(subject) {
    document.getElementById('current-subject-name').textContent = subject;
    document.getElementById('user-stars').textContent = `⭐ ${state.user.stars}`;

    const topics = await api.get(`/content/topics/${state.user.class}/${subject}`);
    state.topics = topics; // Save to state for search
    const map = document.getElementById('game-map');
    map.innerHTML = '';

    topics.forEach((topic, index) => {
        const node = document.createElement('div');
        node.className = 'level-node bounce-in';
        node.innerHTML = `
            <div class="stars">⭐⭐⭐</div>
            <span>${index + 1}</span>
            <button class="puzzle-btn" style="position:absolute; bottom:-10px; font-size:10px;" onclick="event.stopPropagation(); const types=['drag','fill','cross']; loadPuzzle(types[Math.floor(Math.random()*3)])">🧩</button>
        `;
        node.onclick = () => startLearning(topic);
        map.appendChild(node);
    });

    showScreen('map-section');
}

function startLearning(topic) {
    state.currentTopic = topic;
    document.getElementById('topic-title').textContent = topic.name;
    document.getElementById('learning-content').innerHTML = `
        <p>${topic.theory}</p>
        <button class="game-btn primary-btn" onclick="startQuiz()">I'm Ready! Start Quiz</button>
    `;
    document.getElementById('question-view').classList.add('hidden');
    document.getElementById('learning-content').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    showScreen('quiz-section');
}

// Quiz Logic
async function startQuiz() {
    const res = await api.get(`/content/topic/${state.currentTopic._id}`);
    state.quizQuestions = res.questions;
    state.currentQuestionIndex = 0;
    state.score = 0;

    document.getElementById('learning-content').classList.add('hidden');
    document.getElementById('question-view').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    const q = state.quizQuestions[state.currentQuestionIndex];
    document.getElementById('question-text').textContent = q.questionText;
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(idx, btn);
        optionsList.appendChild(btn);
    });
}

async function handleAnswer(idx, btn) {
    const q = state.quizQuestions[state.currentQuestionIndex];
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);

    if (idx === q.correctAnswer) {
        btn.classList.add('correct');
        state.score++;
    } else {
        btn.classList.add('wrong');
        btns[q.correctAnswer].classList.add('correct');
    }

    setTimeout(() => {
        state.currentQuestionIndex++;
        if (state.currentQuestionIndex < state.quizQuestions.length) {
            showQuestion();
        } else {
            finishQuiz();
        }
    }, 1500);
}

async function finishQuiz() {
    document.getElementById('question-view').classList.add('hidden');
    const resultDiv = document.getElementById('quiz-result');
    resultDiv.classList.remove('hidden');

    const res = await api.post('/quiz/submit', {
        userId: state.user.id,
        topicId: state.currentTopic._id,
        score: state.score
    });

    const messages = [
        "Need more practice! Don't give up! 💪",
        "Good effort! You're getting there! 😊",
        "Great job! You're a Science star! ⭐",
        "Incredible! A perfect score! 🏆"
    ];
    let msgIdx = Math.floor(state.score / (state.quizQuestions.length / 3));
    if (msgIdx > 3) msgIdx = 3;

    document.getElementById('result-title').textContent = state.score >= 5 ? 'Quest Completed!' : 'Keep Practicing!';
    document.getElementById('result-stars').textContent = '⭐'.repeat(res.stars);
    document.getElementById('result-msg').textContent = messages[msgIdx];

    // Update local state
    state.user.stars = res.totalStars;
    localStorage.setItem('user', JSON.stringify(state.user));
}

function showMsg(text, type) {
    authMsg.textContent = text;
    authMsg.style.color = type === 'error' ? 'red' : 'green';
}

// Leaderboard Logic
async function loadLeaderboard() {
    const data = await api.get(`/leaderboard/${state.user.class}`);
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';

    data.forEach((user, idx) => {
        const item = document.createElement('div');
        item.className = 'rank-item';
        item.innerHTML = `
            <div class="rank-info">
                <span>#${idx + 1}</span>
                <img src="https://cdn-icons-png.flaticon.com/512/4333/4333609.png" class="rank-avatar">
                <span>${user.name}</span>
            </div>
            <strong>⭐ ${user.stars}</strong>
        `;
        list.appendChild(item);
    });
    showScreen('leaderboard-section');
}

// AI Chat Logic
const chatToggle = document.getElementById('ai-chat-toggle');
const chatWindow = document.getElementById('ai-chat-window');
const closeChat = document.getElementById('close-chat');
const sendAiBtn = document.getElementById('send-ai-btn');
const aiInput = document.getElementById('ai-input');
const chatMessages = document.getElementById('chat-messages');

chatToggle.onclick = () => chatWindow.classList.toggle('hidden');
closeChat.onclick = () => chatWindow.classList.add('hidden');

sendAiBtn.onclick = async () => {
    const text = aiInput.value.trim();
    if (!text) return;

    addChatMsg(text, 'user-msg');
    aiInput.value = '';

    const res = await api.post('/ai/chat', { message: text });
    setTimeout(() => addChatMsg(res.response, 'ai-msg'), 500);
};

function addChatMsg(text, className) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${className}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Teacher Logic
async function loadTeacherDashboard() {
    showScreen('teacher-section');
    loadStudentStats();
}

async function loadStudentStats() {
    const classId = state.user.class;
    const [stats, topics] = await Promise.all([
        api.get(`/teacher/stats/${classId}`),
        api.get(`/content/topics/${classId}/Science`) // Fetching Science topics as default for demo
    ]);

    const statsList = document.getElementById('student-stats-list');
    statsList.innerHTML = '';
    stats.forEach(s => {
        const item = document.createElement('p');
        item.textContent = `${s.name}: ⭐ ${s.stars}`;
        statsList.appendChild(item);
    });

    const topicSelect = document.getElementById('t-topic');
    topicSelect.innerHTML = topics.map(t => `<option value="${t._id}">${t.name}</option>`).join('');
}

async function addQuestion() {
    const topicId = document.getElementById('t-topic').value;
    if (!topicId) return alert('Select a topic first!');

    const qData = {
        topicId: topicId,
        questionText: document.getElementById('t-q-text').value,
        options: [
            document.getElementById('t-opt1').value,
            document.getElementById('t-opt2').value,
            document.getElementById('t-opt3').value,
            document.getElementById('t-opt4').value
        ],
        correctAnswer: parseInt(document.getElementById('t-correct').value)
    };

    const res = await api.post('/teacher/question', qData);
    alert(res.message);
}

// Profile Logic
function loadProfile() {
    document.getElementById('profile-name').textContent = state.user.name;
    document.getElementById('profile-email').textContent = state.user.email;
    document.getElementById('profile-stars').textContent = state.user.stars;
    document.getElementById('profile-badges').textContent = state.user.badges?.length || 0;
    document.getElementById('current-avatar').src = state.user.avatar || 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png';
    showScreen('profile-section');
}

async function setAvatar(src) {
    document.getElementById('current-avatar').src = src;
    state.user.avatar = src;
    localStorage.setItem('user', JSON.stringify(state.user));

    // Call API to save to DB
    try {
        await api.patch('/auth/profile', { avatar: src });
    } catch (e) {
        console.error('Failed to persist avatar', e);
    }
}

// Feedback Logic
let currentRating = 0;
function setRating(n) {
    currentRating = n;
    const stars = document.querySelectorAll('.rating-stars span');
    stars.forEach((s, idx) => {
        if (idx < n) s.classList.add('active');
        else s.classList.remove('active');
    });
}

async function submitFeedback() {
    const text = document.getElementById('feedback-text').value;
    if (!text || currentRating === 0) return alert('Please provide a rating and comments!');

    // In demo, we'll just mock the API call
    showMsg('Thank you for your feedback! 🎉', 'success', 'feedback-msg');
    setTimeout(() => showScreen('profile-section'), 2000);
}

function showMsg(text, type, elementId = 'auth-msg') {
    const el = document.getElementById(elementId);
    el.textContent = text;
    el.style.color = type === 'error' ? 'red' : 'green';
}

// Search Logic
document.getElementById('topic-search').addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');

    if (query.length < 2) {
        resultsDiv.classList.add('hidden');
        return;
    }

    const results = state.topics.filter(t => t.name.toLowerCase().includes(query));

    if (results.length > 0) {
        resultsDiv.innerHTML = results.map(t => `<div onclick="startLearningById('${t._id}')" style="padding:10px; cursor:pointer; border-bottom:1px solid #eee; color:#333;">${t.name}</div>`).join('');
        resultsDiv.classList.remove('hidden');
    } else {
        resultsDiv.innerHTML = '<div style="padding:10px; color:#666;">No topics found 😅</div>';
        resultsDiv.classList.remove('hidden');
    }
});

function startLearningById(id) {
    const topic = state.topics.find(t => t._id === id);
    if (topic) {
        document.getElementById('search-results').classList.add('hidden');
        document.getElementById('topic-search').value = '';
        startLearning(topic);
    }
}

// Puzzle Engine
let currentPuzzleType = 'drag';
let puzzleData = [
    { label: 'Plant', target: 'Producer' },
    { label: 'Lion', target: 'Carnivore' },
    { label: 'Cow', target: 'Herbivore' }
];

function loadPuzzle(type = 'drag') {
    currentPuzzleType = type;
    const items = document.getElementById('puzzle-items');
    const targets = document.getElementById('puzzle-targets');
    const crossword = document.getElementById('crossword-container');
    const instruction = document.getElementById('puzzle-instruction');

    items.innerHTML = '';
    targets.innerHTML = '';
    crossword.innerHTML = '';
    crossword.classList.add('hidden');
    items.classList.remove('hidden');
    targets.classList.remove('hidden');

    if (type === 'drag') {
        instruction.textContent = "Drag parameters to their roles!";
        [...puzzleData].sort(() => Math.random() - 0.5).forEach(p => {
            const d = document.createElement('div');
            d.className = 'puzzle-item';
            d.textContent = p.label;
            d.draggable = true;
            d.ondragstart = (e) => e.dataTransfer.setData('text', p.label);
            items.appendChild(d);
        });
        puzzleData.forEach(p => {
            const box = document.createElement('div');
            box.className = 'target-box';
            box.innerHTML = `<span>${p.target}</span><div class="drop-zone" ondragover="event.preventDefault()" ondrop="handleDrop(event, '${p.target}')"></div>`;
            targets.appendChild(box);
        });
    } else if (type === 'fill') {
        instruction.textContent = "Fill in the missing words!";
        items.classList.add('hidden');
        const fillData = [
            { question: "___ are producers.", answer: "Plants" },
            { question: "A lion is a ___.", answer: "Carnivore" }
        ];
        state.currentFillData = fillData;
        fillData.forEach((f, idx) => {
            const box = document.createElement('div');
            box.className = 'target-box';
            box.innerHTML = `<span>${f.question}</span><input type="text" class="game-input fill-input" style="width:120px; margin:0; padding:5px;" data-idx="${idx}">`;
            targets.appendChild(box);
        });
    } else if (type === 'cross') {
        instruction.textContent = "Find the word: 'STEM' (Down) and 'ROOT' (Across)";
        items.classList.add('hidden');
        targets.classList.add('hidden');
        crossword.classList.remove('hidden');

        // Simple 5x5 Grid for STEM and ROOT
        const grid = [
            ['', 'S', '', '', ''],
            ['R', 'O', 'O', 'T', ''],
            ['', 'E', '', '', ''],
            ['', 'M', '', '', ''],
            ['', '', '', '', '']
        ];
        state.crosswordAnswer = grid;
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const input = document.createElement('input');
                input.className = 'crossword-input';
                input.maxLength = 1;
                input.style.width = '100%';
                input.style.height = '40px';
                input.style.textAlign = 'center';
                input.style.border = '1px solid #ccc';
                input.dataset.r = r;
                input.dataset.c = c;
                crossword.appendChild(input);
            }
        }
    }
    showScreen('puzzle-section');
}

function handleDrop(e, targetName) {
    const label = e.dataTransfer.getData('text');
    const zone = e.target.classList.contains('drop-zone') ? e.target : e.target.closest('.drop-zone');
    if (zone) {
        zone.textContent = label;
        zone.dataset.label = label;
        zone.style.background = '#e8f4fd';
    }
}

function checkPuzzle() {
    let isCorrect = false;
    let correctCount = 0;

    if (currentPuzzleType === 'drag') {
        const zones = document.querySelectorAll('.drop-zone');
        puzzleData.forEach(p => {
            const zone = [...zones].find(z => z.previousElementSibling.textContent === p.target);
            if (zone && zone.dataset.label === p.label) correctCount++;
        });
        isCorrect = (correctCount === puzzleData.length);
    } else if (currentPuzzleType === 'fill') {
        const inputs = document.querySelectorAll('.fill-input');
        state.currentFillData.forEach((f, idx) => {
            if (inputs[idx].value.toLowerCase().trim() === f.answer.toLowerCase()) correctCount++;
        });
        isCorrect = (correctCount === state.currentFillData.length);
    } else if (currentPuzzleType === 'cross') {
        const inputs = document.querySelectorAll('.crossword-input');
        let total = 0;
        inputs.forEach(input => {
            const r = input.dataset.r;
            const c = input.dataset.c;
            const val = input.value.toUpperCase();
            if (state.crosswordAnswer[r][c] !== '') {
                total++;
                if (val === state.crosswordAnswer[r][c]) correctCount++;
            }
        });
        isCorrect = (correctCount === total);
    }

    if (isCorrect) {
        showMsg('Genius! You solved it! 🎉', 'success', 'puzzle-msg');
        setTimeout(() => showScreen('map-section'), 2000);
    } else {
        showMsg(`Try again! Keep hunting!`, 'error', 'puzzle-msg');
    }
}

// Live Monitoring logic
let refreshInterval = null;
document.addEventListener('change', (e) => {
    if (e.target.id === 'live-refresh') {
        if (e.target.checked) {
            refreshInterval = setInterval(loadStudentStats, 5000);
        } else {
            clearInterval(refreshInterval);
        }
    }
});

function logout() {
    localStorage.clear();
    location.reload();
}

