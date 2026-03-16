// متغيرات اللعبة
let board = [];
let boardSize = 3;
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'computer';
let difficulty = 'easy';
let scores = { X: 0, O: 0 };
let moves = 0;
let totalMoves = 0;
let adsShown = 0;
let lastMoveIndex = -1;
let turnCount = 0;

// تهيئة اللعبة
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    loadScores();
    setupEventListeners();
    showStartAd();
});

function initGame() {
    boardSize = parseInt(document.getElementById('level').value);
    createBoard();
    resetGameState();
    updatePlayerNames();
    updateMovesCounter();
}

function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board = Array(boardSize * boardSize).fill('');
    
    boardElement.setAttribute('data-size', boardSize);
    
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
}

function handleCellClick(e) {
    if (!gameActive) return;
    
    const index = parseInt(e.target.dataset.index);
    
    if (board[index] !== '') return;
    
    if (gameMode === 'twoPlayer') {
        // لعب لاعبين
        makeMove(index);
        if (checkGameStatus()) {
            // استمرار اللعبة
        }
    } else {
        // لعب ضد الكمبيوتر
        if (currentPlayer === 'X') {
            makeMove(index);
            if (checkGameStatus()) {
                // إذا استمرت اللعبة، دور الكمبيوتر
                setTimeout(() => makeComputerMove(), 500);
            }
        }
    }
}

function makeMove(index) {
    board[index] = currentPlayer;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    
    // إزالة تظليل آخر حركة
    if (lastMoveIndex !== -1) {
        const lastCell = document.querySelector(`[data-index="${lastMoveIndex}"]`);
        if (lastCell) {
            lastCell.classList.remove('last-move');
        }
    }
    cell.classList.add('last-move');
    lastMoveIndex = index;
    
    moves++;
    totalMoves++;
    updateMovesCounter();
    
    // إظهار إعلان كل 3 أدوار
    turnCount++;
    if (turnCount % 3 === 0 && gameActive) {
        showTurnAd(turnCount);
    }
}

function makeComputerMove() {
    if (!gameActive || currentPlayer !== 'O') return;
    
    let move;
    switch(difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = getMediumMove();
            break;
        case 'hard':
            move = getHardMove();
            break;
    }
    
    if (move !== undefined) {
        makeMove(move);
        checkGameStatus();
    }
}

function getRandomMove() {
    const emptyCells = board.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    
    if (emptyCells.length > 0) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    return undefined;
}

function getMediumMove() {
    // محاولة الفوز
    const winMove = findWinningMove('O');
    if (winMove !== undefined) return winMove;
    
    // منع فوز الخصم
    const blockMove = findWinningMove('X');
    if (blockMove !== undefined) return blockMove;
    
    // حركة عشوائية
    return getRandomMove();
}

function getHardMove() {
    // استراتيجية متقدمة للمستوى الصعب
    const winMove = findWinningMove('O');
    if (winMove !== undefined) return winMove;
    
    const blockMove = findWinningMove('X');
    if (blockMove !== undefined) return blockMove;
    
    // استراتيجية المركز
    const center = Math.floor(boardSize * boardSize / 2);
    if (board[center] === '') return center;
    
    // الزوايا
    const corners = [0, boardSize - 1, boardSize * (boardSize - 1), boardSize * boardSize - 1];
    const availableCorners = corners.filter(i => board[i] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    return getRandomMove();
}

function findWinningMove(player) {
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = player;
            if (checkWinner() === player) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    return undefined;
}

function checkGameStatus() {
    const winner = checkWinner();
    
    if (winner) {
        gameActive = false;
        scores[winner]++;
        updateScores();
        highlightWinningCells(winner);
        showStatus(winner);
        return false;
    } else if (isBoardFull()) {
        gameActive = false;
        showStatus('draw');
        return false;
    } else {
        switchPlayer();
        return true;
    }
}

function checkWinner() {
    const size = boardSize;
    
    // التحقق من الأفقية
    for (let row = 0; row < size; row++) {
        const first = board[row * size];
        if (first === '') continue;
        let win = true;
        for (let col = 1; col < size; col++) {
            if (board[row * size + col] !== first) {
                win = false;
                break;
            }
        }
        if (win) return first;
    }
    
    // التحقق من العمودية
    for (let col = 0; col < size; col++) {
        const first = board[col];
        if (first === '') continue;
        let win = true;
        for (let row = 1; row < size; row++) {
            if (board[row * size + col] !== first) {
                win = false;
                break;
            }
        }
        if (win) return first;
    }
    
    // التحقق من القطر الرئيسي
    let first = board[0];
    if (first !== '') {
        let win = true;
        for (let i = 1; i < size; i++) {
            if (board[i * size + i] !== first) {
                win = false;
                break;
            }
        }
        if (win) return first;
    }
    
    // التحقق من القطر الثانوي
    first = board[size - 1];
    if (first !== '') {
        let win = true;
        for (let i = 1; i < size; i++) {
            if (board[i * size + (size - 1 - i)] !== first) {
                win = false;
                break;
            }
        }
        if (win) return first;
    }
    
    return null;
}

function highlightWinningCells(winner) {
    const size = boardSize;
    const cells = document.querySelectorAll('.cell');
    
    // إزالة التظليل السابق
    cells.forEach(cell => cell.classList.remove('win'));
    
    // تظليل الخلايا الفائزة
    for (let i = 0; i < board.length; i++) {
        if (board[i] === winner) {
            cells[i].classList.add('win');
        }
    }
}

function isBoardFull() {
    return board.every(cell => cell !== '');
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('currentPlayerDisplay');
    display.textContent = currentPlayer;
    
    if (gameMode === 'computer' && currentPlayer === 'O') {
        display.textContent = '🤖';
    }
}

function updateMovesCounter() {
    const maxMoves = boardSize * boardSize;
    document.getElementById('movesCounter').textContent = `${moves}/${maxMoves}`;
    document.getElementById('totalMoves').textContent = totalMoves;
}

function updateScores() {
    document.getElementById('scoreX').textContent = scores.X;
    document.getElementById('scoreO').textContent = scores.O;
    saveScores();
}

function updatePlayerNames() {
    if (gameMode === 'computer') {
        document.getElementById('player1Label').textContent = 'اللاعب X';
        document.getElementById('player2Label').textContent = 'الكمبيوتر O';
        document.getElementById('difficultyGroup').style.display = 'block';
    } else {
        document.getElementById('player1Label').textContent = 'اللاعب X';
        document.getElementById('player2Label').textContent = 'اللاعب O';
        document.getElementById('difficultyGroup').style.display = 'none';
    }
}

function showStatus(result) {
    const display = document.getElementById('currentPlayerDisplay');
    if (result === 'X') {
        display.textContent = '❌ فاز!';
    } else if (result === 'O') {
        display.textContent = '⭕ فاز!';
    } else if (result === 'draw') {
        display.textContent = 'تعادل!';
    }
}

function resetGame() {
    board = Array(boardSize * boardSize).fill('');
    currentPlayer = 'X';
    gameActive = true;
    moves = 0;
    
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'win', 'last-move');
    });
    
    updateDisplay();
    updateMovesCounter();
    lastMoveIndex = -1;
}

function resetGameState() {
    resetGame();
}

function resetScores() {
    if (confirm('هل أنت متأكد من تصفير النقاط؟')) {
        scores = { X: 0, O: 0 };
        updateScores();
        resetGame();
    }
}

function saveScores() {
    localStorage.setItem('xoAdvancedScores', JSON.stringify(scores));
}

function loadScores() {
    const saved = localStorage.getItem('xoAdvancedScores');
    if (saved) {
        scores = JSON.parse(saved);
        updateScores();
    }
}

function changeGameMode() {
    gameMode = document.getElementById('gameMode').value;
    updatePlayerNames();
    resetGame();
}

function changeLevel() {
    initGame();
    resetGame();
}

// نظام الإعلانات
function showStartAd() {
    const startAd = document.getElementById('startAd');
    if (startAd) {
        startAd.style.display = 'block';
        adsShown++;
        updateAdStats();
    }
}

function closeStartAd() {
    document.getElementById('startAd').style.display = 'none';
}

function showTurnAd(turnNumber) {
    const turnAdContainer = document.getElementById('turnAdContainer');
    document.getElementById('turnNumber').textContent = turnNumber;
    turnAdContainer.classList.remove('hidden');
    adsShown++;
    updateAdStats();
    
    // إخفاء الإعلان بعد 4 ثواني
    setTimeout(() => {
        closeTurnAd();
    }, 4000);
}

function closeTurnAd() {
    document.getElementById('turnAdContainer').classList.add('hidden');
}

function updateAdStats() {
    document.getElementById('adsShown').textContent = adsShown;
}

// تغيير الصعوبة
document.getElementById('difficulty').addEventListener('change', function() {
    difficulty = this.value;
});

// إغلاق الإعلانات
document.querySelectorAll('.ad-close, .ad-close-small').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const ad = this.closest('[id*="Ad"], [class*="ad"]');
        if (ad) {
            ad.style.display = 'none';
        }
    });
});