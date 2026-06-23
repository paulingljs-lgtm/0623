// Tetris Game
class TetrisGame {
    constructor() {
        // Game Board
        this.cols = 10;
        this.rows = 20;
        this.blockSize = 30;
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));

        // Game State
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.nextPiece = this.getRandomPiece();
        this.currentPiece = this.getRandomPiece();
        this.currentX = Math.floor(this.cols / 2) - 1;
        this.currentY = 0;

        // Canvas Setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas.getContext('2d');

        // Game Speed
        this.dropCounter = 0;
        this.dropInterval = 1000; // milliseconds

        // Tetris Pieces
        this.pieces = {
            I: {
                shape: [[1, 1, 1, 1]],
                color: '#00f0f0'
            },
            O: {
                shape: [[1, 1], [1, 1]],
                color: '#f0f000'
            },
            T: {
                shape: [[0, 1, 0], [1, 1, 1]],
                color: '#a000f0'
            },
            S: {
                shape: [[0, 1, 1], [1, 1, 0]],
                color: '#00f000'
            },
            Z: {
                shape: [[1, 1, 0], [0, 1, 1]],
                color: '#f00000'
            },
            J: {
                shape: [[1, 0, 0], [1, 1, 1]],
                color: '#0000f0'
            },
            L: {
                shape: [[0, 0, 1], [1, 1, 1]],
                color: '#f0a000'
            }
        };

        this.setupEventListeners();
    }

    getRandomPiece() {
        const keys = Object.keys(this.pieces);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return JSON.parse(JSON.stringify(this.pieces[randomKey]));
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());

        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.moveLeft();
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.rotate();
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.dropCounter = this.dropInterval;
                    e.preventDefault();
                    break;
                case ' ':
                    this.drop();
                    e.preventDefault();
                    break;
            }
        });
    }

    start() {
        if (this.gameRunning) return;
        this.gameRunning = true;
        this.gamePaused = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        this.gameLoop();
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? '繼續' : '暫停';
    }

    reset() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropCounter = 0;
        this.nextPiece = this.getRandomPiece();
        this.currentPiece = this.getRandomPiece();
        this.currentX = Math.floor(this.cols / 2) - 1;
        this.currentY = 0;

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = '暫停';
        this.updateScore();
        this.draw();
    }

    moveLeft() {
        if (this.canMove(this.currentX - 1, this.currentY)) {
            this.currentX--;
        }
    }

    moveRight() {
        if (this.canMove(this.currentX + 1, this.currentY)) {
            this.currentX++;
        }
    }

    rotate() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;

        if (!this.canMove(this.currentX, this.currentY)) {
            this.currentPiece.shape = originalShape;
        }
    }

    rotateMatrix(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    }

    drop() {
        let y = this.currentY;
        while (this.canMove(this.currentX, y + 1)) {
            y++;
        }
        this.currentY = y;
    }

    canMove(x, y) {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;

                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return false;
                    }

                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const y = this.currentY + row;
                    const x = this.currentX + col;

                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            }
        }

        this.clearLines();
        this.nextPiece = this.currentPiece;
        this.currentPiece = this.getRandomPiece();
        this.currentX = Math.floor(this.cols / 2) - 1;
        this.currentY = 0;

        if (!this.canMove(this.currentX, this.currentY)) {
            this.gameRunning = false;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            alert(`遊戲結束!\n最終分數: ${this.score}`);
        }
    }

    clearLines() {
        let linesCleared = 0;

        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                row++;
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 10 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 50);
            this.updateScore();
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    gameLoop() {
        const now = Date.now();
        let lastTime = now;

        const update = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            if (this.gameRunning && !this.gamePaused) {
                this.dropCounter += deltaTime;

                if (this.dropCounter >= this.dropInterval) {
                    if (this.canMove(this.currentX, this.currentY + 1)) {
                        this.currentY++;
                    } else {
                        this.placePiece();
                    }
                    this.dropCounter = 0;
                }

                this.draw();
            }

            if (this.gameRunning) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.blockSize, 0);
            this.ctx.lineTo(i * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.blockSize);
            this.ctx.lineTo(this.canvas.width, i * this.blockSize);
            this.ctx.stroke();
        }

        // Draw board
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col, row, this.board[row][col]);
                }
            }
        }

        // Draw current piece
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    this.drawBlock(
                        this.currentX + col,
                        this.currentY + row,
                        this.currentPiece.color
                    );
                }
            }
        }

        // Draw next piece preview
        this.previewCtx.fillStyle = '#1a1a1a';
        this.previewCtx.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        this.drawPreview();
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.blockSize + 1,
            y * this.blockSize + 1,
            this.blockSize - 2,
            this.blockSize - 2
        );

        // Add border for 3D effect
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            x * this.blockSize + 1,
            y * this.blockSize + 1,
            this.blockSize - 2,
            this.blockSize - 2
        );
    }

    drawPreview() {
        const previewBlockSize = 30;
        const startX = (this.previewCanvas.width - this.nextPiece.shape[0].length * previewBlockSize) / 2;
        const startY = (this.previewCanvas.height - this.nextPiece.shape.length * previewBlockSize) / 2;

        for (let row = 0; row < this.nextPiece.shape.length; row++) {
            for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
                if (this.nextPiece.shape[row][col]) {
                    const x = startX + col * previewBlockSize;
                    const y = startY + row * previewBlockSize;

                    this.previewCtx.fillStyle = this.nextPiece.color;
                    this.previewCtx.fillRect(x + 1, y + 1, previewBlockSize - 2, previewBlockSize - 2);

                    this.previewCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    this.previewCtx.lineWidth = 1;
                    this.previewCtx.strokeRect(x + 1, y + 1, previewBlockSize - 2, previewBlockSize - 2);
                }
            }
        }
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});
