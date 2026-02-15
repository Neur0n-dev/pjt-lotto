(function () {
    // 기본값
    let targetDrwNo = null;

    // DOM 요소
    const elTitle = document.getElementById('drw-title');
    const elBtnRecommend = document.getElementById('btn-recommend');

    // ===== 토스트 알림 =====
    const elToastContainer = document.getElementById('toast-container');

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        elToastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ===== 헤더 렌더링 =====
    function renderHeader(data) {
        //헤더
        elTitle.textContent = data.drwNo + ' 회차 로또 번호 추천';
    }

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

    function getSelectedStrategy() {
        const activeBtn = document.querySelector('.btn-strategy.active');

        if (!activeBtn) return null;

        return activeBtn.dataset.strategy;
    }

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

            scrollToResult();
        });

    }

    // 결과 영역으로 스크롤
    function scrollToResult() {
        document.getElementById('section-result')
            .scrollIntoView({behavior: 'smooth', block: 'start'});
    }

    // ===== 데이터 가공 =====
    function transformRecommendResponse(data) {
        if (!data || !Array.isArray(data.tickets)) {
            return [];
        }

        return data.tickets.map(ticket => ({
            numbers: ticket,
            strategy: data.strategy
        }));
    }

    // ===== 버튼 이벤트 =====
    elBtnRecommend.addEventListener('click', (e) => {
        try {
            getRecommendTickets();
        } catch (e) {
            console.error(e);
        }
    })

    // ===== API 호출 =====
    var drwNoPending = false;
    var recommendTicketPending = false;

    // 마지막회차 가져오기
    function fetchGetDrwNo() {
        if (drwNoPending) return;
        drwNoPending = true;
        fetch('/draw/latest')
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
                if (data.result) {
                    renderHeader(data);
                } else {
                    showToast(data.message || '회차 정보를 불러올 수 없습니다.');
                }
            })
            .catch(function () {
                showToast('서버와 통신할 수 없습니다.');
            })
            .finally(function () {
                drwNoPending = false;
            });
    }

    // 추천 번호 가져오기
    function getRecommendTickets() {
        if (recommendTicketPending) return;
        recommendTicketPending = true;
        fetch('/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                strategy: getSelectedStrategy(),
                fixedNumbers: getFixedNumbers(),
                excludeNumbers: getExcludeNumbers(),
                count: getCount(),
            })
        })
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
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
            .catch(function () {
                showToast('서버와 통신할 수 없습니다.');
            })
            .finally(function () {
                recommendTicketPending = false;
            });
    }

    // ===== init =====
    fetchGetDrwNo();
})();