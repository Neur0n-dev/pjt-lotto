// 전략 버튼 클릭 → 버튼 active 전환 + 설명 전환 + all 카운터 제어
document.querySelectorAll('.btn-strategy').forEach(btn => {
    btn.addEventListener('click', () => {
        const strategy = btn.dataset.strategy;

        // 버튼 active 전환
        document.querySelector('.btn-strategy.active').classList.remove('active');
        btn.classList.add('active');

        // 설명 active 전환
        document.querySelector('.strategy-desc.active').classList.remove('active');
        document.querySelector(`.strategy-desc[data-strategy="${strategy}"]`).classList.add('active');

        // all 선택 시 카운터 비활성화
        toggleCounter(strategy !== 'all');
    });
});

// 포함/제외 번호 입력 → 숫자만 허용, 1~45 범위 제한
document.querySelectorAll('.input-fixed, .input-exclude').forEach(input => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '');
        const num = Number(input.value);
        if (num > 45) input.value = '45';
        if (input.value !== '' && num < 1) input.value = '1';
    });
});

// 생성 개수 카운터
const MIN_COUNT = 1;
const MAX_COUNT = 10;
const counterValue = document.getElementById('counter-value');
const counterHint = document.getElementById('counter-hint');
const btnMinus = document.getElementById('btn-minus');
const btnPlus = document.getElementById('btn-plus');

btnMinus.addEventListener('click', () => {
    const cur = Number(counterValue.textContent);
    if (cur > MIN_COUNT) counterValue.textContent = cur - 1;
});

btnPlus.addEventListener('click', () => {
    const cur = Number(counterValue.textContent);
    if (cur < MAX_COUNT) counterValue.textContent = cur + 1;
});

function getCount() {
    return Number(counterValue.textContent);
}

// all 전략 시 카운터 비활성화/활성화
let savedCount = 1;

function toggleCounter(enabled) {
    if (enabled) {
        btnMinus.disabled = false;
        btnPlus.disabled = false;
        counterValue.textContent = savedCount;
        counterHint.textContent = '최대 10세트';
        document.querySelector('.count-box').classList.remove('disabled');
    } else {
        savedCount = Number(counterValue.textContent);
        btnMinus.disabled = true;
        btnPlus.disabled = true;
        counterValue.textContent = '-';
        counterHint.textContent = '전략별 1세트씩 생성됩니다.';
        document.querySelector('.count-box').classList.add('disabled');
    }
}

// 포함/제외 번호 데이터 수집
function getFixedNumbers() {
    return [...document.querySelectorAll('#fixed-numbers .input-fixed')]
        .map(el => Number(el.value))
        .filter(n => n >= 1 && n <= 45);
}

function getExcludeNumbers() {
    return [...document.querySelectorAll('#exclude-numbers .input-exclude')]
        .map(el => Number(el.value))
        .filter(n => n >= 1 && n <= 45);
}

// 번호 → 구간 색상 클래스
function getBallRange(num) {
    if (num <= 10) return 'range-1';
    if (num <= 20) return 'range-2';
    if (num <= 30) return 'range-3';
    if (num <= 40) return 'range-4';
    return 'range-5';
}

// 추천 결과 렌더링
// data: [{ numbers: [3,12,25,33,41,44], strategy: 'random' }, ...]
function renderResults(data) {
    const resultEmpty = document.getElementById('result-empty');
    const resultList = document.getElementById('result-list');

    resultList.innerHTML = '';

    if (!data || data.length === 0) {
        resultEmpty.style.display = '';
        return;
    }

    resultEmpty.style.display = 'none';

    data.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'result-card';

        // 전략 태그
        if (item.strategy) {
            const tag = document.createElement('span');
            tag.className = 'result-strategy';
            tag.dataset.strategy = item.strategy;
            tag.textContent = item.strategy.charAt(0).toUpperCase() + item.strategy.slice(1);
            card.appendChild(tag);
        }

        // 번호 볼
        const balls = document.createElement('div');
        balls.className = 'result-balls';
        item.numbers.sort((a, b) => a - b).forEach(num => {
            const ball = document.createElement('span');
            ball.className = `ball ${getBallRange(num)}`;
            ball.textContent = num;
            balls.appendChild(ball);
        });

        card.appendChild(balls);
        resultList.appendChild(card);
    });

}

// 결과 영역으로 스크롤
function scrollToResult() {
    document.getElementById('section-result')
        .scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// TODO: 임시 샘플 데이터 (API 연동 후 제거)
renderResults([
    { numbers: [3, 11, 22, 33, 41, 45], strategy: 'random' },
    { numbers: [7, 14, 19, 28, 36, 42], strategy: 'evenOdd' },
    { numbers: [1, 9, 15, 27, 34, 43], strategy: 'sumRange' },
    { numbers: [5, 12, 23, 31, 38, 44], strategy: 'hotCold' },
    { numbers: [2, 16, 24, 30, 39, 45], strategy: 'frequency' },
    { numbers: [2, 16, 24, 30, 39, 45], strategy: 'frequency' },
    { numbers: [2, 16, 24, 30, 39, 45], strategy: 'frequency' },
]);
