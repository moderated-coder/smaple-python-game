// static/script.js

// 1. DOM 요소 가져오기
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');

// 2. 게임 상태 변수
let playerX; // 플레이어 가로 위치 (left 값)
const playerSpeed = 15; // 플레이어 이동 속도
let obstacles = []; // 활성화된 장애물 요소 배열
let score = 0;
let gameInterval; // 게임 루프 ID (나중에 중지하기 위해)
let obstacleSpeed = 3; // 장애물 떨어지는 속도
let obstacleFrequency = 500; // 장애물 생성 간격 (ms)
let lastObstacleTime = 0;
let isGameOver = false;

// 게임 영역 경계 계산
const gameAreaWidth = gameArea.offsetWidth;
const playerWidth = player.offsetWidth;

// 3. 초기화 함수
function initializeGame() {
    // 플레이어 초기 위치 설정 (가운데)
    playerX = (gameAreaWidth - playerWidth) / 2;
    player.style.left = `${playerX}px`;
    // 점수 초기화
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    // 기존 장애물 제거
    obstacles.forEach(obstacle => obstacle.remove());
    obstacles = [];
    // 게임 오버 상태 초기화
    isGameOver = false;
    lastObstacleTime = 0; // 마지막 장애물 생성 시간 초기화
    // 게임 루프 시작 (만약 이전에 실행 중이었다면 중지 후 시작)
    cancelAnimationFrame(gameInterval); // 기존 루프 취소
    gameInterval = requestAnimationFrame(gameLoop); // 새 루프 시작
    console.log("Game Initialized and Loop Started");
}

// 4. 키보드 입력 처리
document.addEventListener('keydown', (event) => {
    if (isGameOver) return; // 게임 오버 시 이동 불가

    if (event.key === 'ArrowLeft') {
        playerX -= playerSpeed;
    } else if (event.key === 'ArrowRight') {
        playerX += playerSpeed;
    }

    // 경계 체크: 플레이어가 게임 영역 밖으로 나가지 않도록
    if (playerX < 0) {
        playerX = 0;
    } else if (playerX > gameAreaWidth - playerWidth) {
        playerX = gameAreaWidth - playerWidth;
    }

    // 플레이어 위치 업데이트
    player.style.left = `${playerX}px`;
});

// 5. 장애물 생성 함수
function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');

    // 장애물 가로 위치 랜덤 설정 (게임 영역 내)
    const obstacleWidth = 50; // CSS와 동일하게 맞춰야 함
    obstacle.style.left = `${Math.random() * (gameAreaWidth - obstacleWidth)}px`;
    obstacle.style.top = '0px'; // 화면 상단에서 시작

    // 게임 영역에 장애물 추가
    gameArea.appendChild(obstacle);
    // 장애물 배열에 추가
    obstacles.push(obstacle);
}

// 6. 장애물 이동 및 관리 함수
function moveObstacles() {
    // 모든 장애물 요소를 아래로 이동
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        let obstacleTop = parseInt(obstacle.style.top); // 현재 top 위치 가져오기
        obstacleTop += obstacleSpeed; // 속도만큼 아래로 이동
        obstacle.style.top = `${obstacleTop}px`;

        // 장애물이 화면 밖으로 나갔는지 확인
        if (obstacleTop > gameArea.offsetHeight) {
            obstacle.remove(); // DOM에서 제거
            obstacles.splice(i, 1); // 배열에서 제거
            // 점수 증가
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            // (선택적) 점수에 따라 난이도 상승 (속도 증가 등)
            if (score % 5 === 0) { // 예: 5점마다 속도 증가
                 obstacleSpeed += 0.5;
                 obstacleFrequency = Math.max(500, obstacleFrequency - 100); // 생성 주기 빨라짐 (최소 500ms)
                 console.log(`Level Up! Speed: ${obstacleSpeed}, Frequency: ${obstacleFrequency}`);
            }
        }
    }
}

// 7. 충돌 감지 함수
function checkCollision() {
    const playerRect = player.getBoundingClientRect(); // 플레이어 경계 정보

    for (const obstacle of obstacles) {
        const obstacleRect = obstacle.getBoundingClientRect(); // 장애물 경계 정보

        // 충돌 조건: AABB(Axis-Aligned Bounding Box) 충돌 검사
        if (
            playerRect.left < obstacleRect.right &&
            playerRect.right > obstacleRect.left &&
            playerRect.top < obstacleRect.bottom &&
            playerRect.bottom > obstacleRect.top
        ) {
            // 충돌 발생!
            isGameOver = true;
            console.log("Collision Detected!");
            break; // 충돌했으면 더 이상 검사할 필요 없음
        }
    }
}

// 8. 게임 루프 함수
function gameLoop(timestamp) { // timestamp는 requestAnimationFrame이 제공
    if (isGameOver) {
        alert(`Game Over! Your Score: ${score}`);
        // 게임 루프 중지 (이미 isGameOver 플래그로 인해 로직은 멈춤)
        // 필요하다면 여기서 재시작 버튼 등을 표시할 수 있음
        cancelAnimationFrame(gameInterval); // 확실하게 루프 취소
        console.log("Game Loop Stopped");
        // 재시작 로직 (예: 스페이스바 누르면 재시작)
        document.addEventListener('keydown', function restartHandler(e) {
            if (e.key === ' ') {
                document.removeEventListener('keydown', restartHandler); // 핸들러 자체 제거
                initializeGame(); // 게임 재초기화 및 시작
            }
        }, { once: false }); // once: true 대신 수동 제거 방식 사용
        alert("Press Spacebar to restart.");
        return; // 루프 종료
    }

    // 일정 시간마다 장애물 생성
    if (timestamp - lastObstacleTime > obstacleFrequency) {
        createObstacle();
        lastObstacleTime = timestamp; // 마지막 생성 시간 업데이트
    }

    // 장애물 이동
    moveObstacles();

    // 충돌 감지
    checkCollision();

    // 다음 프레임 요청
    gameInterval = requestAnimationFrame(gameLoop);
}

// 9. 게임 시작
// DOM이 완전히 로드된 후 게임 초기화 및 시작
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing game...");
    initializeGame();
});
