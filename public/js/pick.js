(function () {

    // ===== 상수 =====
    const MIN_COUNT = 1;
    const MAX_COUNT = 10;

    // ===== DOM 요소 =====
    const elTitle = document.getElementById('drw-title');
    const elBtnRecommend = document.getElementById('btn-recommend');
    const elToastContainer = document.getElementById('toast-container');
    const elCounterValue = document.getElementById('counter-value');
    const elCounterHint = document.getElementById('counter-hint');
    const elBtnMinus = document.getElementById('btn-minus');
    const elBtnPlus = document.getElementById('btn-plus');
    const elResultEmpty = document.getElementById('result-empty');
    const elResultList = document.getElementById('result-list');
    const elSectionResult = document.getElementById('section-result');
    const elCountBox = document.querySelector('.count-box');

    // ===== 유틸 함수 =====
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        elToastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function getBallRange(num) {
        if (num <= 10) return 'range-1';
        if (num <= 20) return 'range-2';
        if (num <= 30) return 'range-3';
        if (num <= 40) return 'range-4';
        return 'range-5';
    }

    function scrollToResult() {
        elSectionResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ===== 데이터 수집 =====
    function getSelectedStrategy() {
        const activeBtn = document.querySelector('.btn-strategy.active');
        return activeBtn ? activeBtn.dataset.strategy : null;
    }

    function getCount() {
        return Number(elCounterValue.textContent);
    }

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

    // ===== 데이터 가공 =====
    function transformRecommendResponse(data) {
        if (!data || !Array.isArray(data.tickets)) {
            return [];
        }

        return data.tickets.map((ticket, i) => ({
            numbers: ticket,
            strategy: data.strategies ? data.strategies[i] : data.strategy
        }));
    }

    // ===== 렌더링 =====
    function renderHeader(data) {
        elTitle.textContent = data.drwNo + ' 회차 로또 번호 추천';
    }

    function renderResults(data) {
        elResultList.innerHTML = '';

        if (!data || data.length === 0) {
            elResultEmpty.style.display = '';
            return;
        }

        elResultEmpty.style.display = 'none';

        data.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'result-card';

            if (item.strategy) {
                const tag = document.createElement('span');
                tag.className = 'result-strategy';
                tag.dataset.strategy = item.strategy;
                tag.textContent = item.strategy.charAt(0).toUpperCase() + item.strategy.slice(1);
                card.appendChild(tag);
            }

            const balls = document.createElement('div');
            balls.className = 'result-balls';
            item.numbers.sort((a, b) => a - b).forEach(num => {
                const ball = document.createElement('span');
                ball.className = `ball ${getBallRange(num)}`;
                ball.textContent = num;
                balls.appendChild(ball);
            });

            card.appendChild(balls);
            elResultList.appendChild(card);
        });

        scrollToResult();
    }

    // ===== 카운터 제어 =====
    let savedCount = 1;

    function toggleCounter(enabled) {
        if (enabled) {
            elBtnMinus.disabled = false;
            elBtnPlus.disabled = false;
            elCounterValue.textContent = savedCount;
            elCounterHint.textContent = '최대 10세트';
            elCountBox.classList.remove('disabled');
        } else {
            savedCount = Number(elCounterValue.textContent);
            elBtnMinus.disabled = true;
            elBtnPlus.disabled = true;
            elCounterValue.textContent = '-';
            elCounterHint.textContent = '전략별 1세트씩 생성됩니다.';
            elCountBox.classList.add('disabled');
        }
    }

    // ===== 이벤트 바인딩 =====

    // 전략 버튼 클릭
    document.querySelectorAll('.btn-strategy').forEach(btn => {
        btn.addEventListener('click', () => {
            const strategy = btn.dataset.strategy;

            document.querySelector('.btn-strategy.active').classList.remove('active');
            btn.classList.add('active');

            document.querySelector('.strategy-desc.active').classList.remove('active');
            document.querySelector(`.strategy-desc[data-strategy="${strategy}"]`).classList.add('active');

            toggleCounter(strategy !== 'all');
        });
    });

    // 포함/제외 번호 입력 제한
    document.querySelectorAll('.input-fixed, .input-exclude').forEach(input => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9]/g, '');
            const num = Number(input.value);
            if (num > 45) input.value = '45';
            if (input.value !== '' && num < 1) input.value = '1';
        });
    });

    // 카운터 버튼
    elBtnMinus.addEventListener('click', () => {
        const cur = Number(elCounterValue.textContent);
        if (cur > MIN_COUNT) elCounterValue.textContent = cur - 1;
    });

    elBtnPlus.addEventListener('click', () => {
        const cur = Number(elCounterValue.textContent);
        if (cur < MAX_COUNT) elCounterValue.textContent = cur + 1;
    });

    // 추천 버튼
    elBtnRecommend.addEventListener('click', () => {
        getRecommendTickets();
    });

    // ===== API 호출 =====
    let drwNoPending = false;
    let recommendTicketPending = false;

    function fetchGetDrwNo() {
        if (drwNoPending) return;
        drwNoPending = true;
        fetch('/draw/latest')
            .then(res => res.json())
            .then(data => {
                if (data.result) {
                    renderHeader(data);
                } else {
                    showToast(data.message || '회차 정보를 불러올 수 없습니다.');
                }
            })
            .catch(() => {
                showToast('서버와 통신할 수 없습니다.');
            })
            .finally(() => {
                drwNoPending = false;
            });
    }

    function getRecommendTickets() {
        if (recommendTicketPending) return;
        recommendTicketPending = true;
        fetch('/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                strategy: getSelectedStrategy(),
                fixedNumbers: getFixedNumbers(),
                excludeNumbers: getExcludeNumbers(),
                count: getCount(),
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.result) {
                    const formattedData = transformRecommendResponse(data);
                    renderResults(formattedData);
                } else {
                    const msg = data.errors
                        ? data.errors.join('\n')
                        : (data.message || '번호 추천에 실패했습니다.');
                    showToast(msg);
                }
            })
            .catch(() => {
                showToast('서버와 통신할 수 없습니다.');
            })
            .finally(() => {
                recommendTicketPending = false;
            });
    }

    // ===== init =====
    fetchGetDrwNo();
})();
