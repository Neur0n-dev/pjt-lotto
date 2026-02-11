(function () {
    // EJS에서 전달받은 회차 (null이면 서버가 최신 회차 결정)
    let currentDrwNo = window.__DASHBOARD_DRW_NO__;
    let latestDrwNo = null;

    // DOM 요소
    const elTitle = document.getElementById('drw-title');
    const elBtnPrev = document.getElementById('btn-prev');
    const elBtnNext = document.getElementById('btn-next');
    const elTotalPurchases = document.getElementById('total-purchases');
    const elTotalRecommends = document.getElementById('total-recommends');
    const elTotalWins = document.getElementById('total-wins');
    const elWinRate = document.getElementById('win-rate');
    const elPurchaseCount = document.getElementById('purchase-count');
    const elRecommendCount = document.getElementById('recommend-count');
    // const elRecentPurchases = document.getElementById('recent-purchases');
    // const elRecentRecommends = document.getElementById('recent-recommends');

    // Chart 인스턴스
    let chartTopNumbers = null;
    let chartStrategy = null;
    // let chartTrend = null;
    // let chartRank = null;

    // ===== 유틸 =====
    function numberWithCommas(n) {
        return n != null ? n.toLocaleString() : '-';
    }

    // function renderBalls(numbers) {
    //     return numbers.map(function (n) {
    //         return '<span class="lotto-ball ' + ballColorClass(n) + '">' + n + '</span>';
    //     }).join(' ');
    // }

    // function renderRecentList(el, items, timeKey) {
    //     if (!items || items.length === 0) {
    //         el.innerHTML = '<li class="empty">데이터 없음</li>';
    //         return;
    //     }
    //     el.innerHTML = items.map(function (item) {
    //         var time = item[timeKey] || '';
    //         // 시간 부분만 추출 (HH:MM:SS)
    //         var shortTime = time.length > 10 ? time.substring(11, 19) : time;
    //         return '<li><span class="recent-time">' + shortTime + '</span>' + renderBalls(item.numbers) + '</li>';
    //     }).join('');
    // }

    // ===== 회차 이동 =====
    function updateNavButtons() {
        elBtnPrev.disabled = !currentDrwNo || currentDrwNo <= 1;
        elBtnNext.disabled = !currentDrwNo || !latestDrwNo || currentDrwNo >= latestDrwNo;
    }

    elBtnPrev.addEventListener('click', function () {
        if (currentDrwNo && currentDrwNo > 1) {
            location.href = '/dashboard/' + (currentDrwNo - 1);
        }
    });

    elBtnNext.addEventListener('click', function () {
        if (currentDrwNo && latestDrwNo && currentDrwNo < latestDrwNo) {
            location.href = '/dashboard/' + (currentDrwNo + 1);
        }
    });

    // ===== Summary 렌더링 =====
    function renderSummary(data) {
        currentDrwNo = data.drwNo;
        latestDrwNo = data.latestDrwNo || data.drwNo;

        // 헤더
        elTitle.textContent = data.drwNo + ' 회차';
        updateNavButtons();

        // // 1행 카드
        elTotalPurchases.textContent = numberWithCommas(data.summary.totalPurchases);
        elTotalRecommends.textContent = numberWithCommas(data.summary.totalRecommends);
        elTotalWins.textContent = numberWithCommas(data.summary.totalWins);
        elWinRate.textContent = data.summary.winRate + '%';

        // // 2행 실시간 카운터
        elPurchaseCount.textContent = numberWithCommas(data.realtimeCounters.purchaseCount);
        elRecommendCount.textContent = numberWithCommas(data.realtimeCounters.recommendCount);

        // // 2행 최근 3건
        // renderRecentList(elRecentPurchases, data.recentPurchases, 'purchaseAt');
        // renderRecentList(elRecentRecommends, data.recentRecommends, 'createdDate');

        // // 차트 (개별 try-catch로 하나 실패해도 나머지 렌더링)
        try { renderTopNumbersChart(data.topPurchasedNumbers); } catch (e) { console.error('chart-top-numbers error:', e); }
        try { renderStrategyChart(data.purchaseSourceRatio); } catch (e) { console.error('chart-strategy error:', e); }
        // try { renderTrendChart(data.purchaseTrend, data.recommendTrend); } catch (e) { console.error('chart-trend error:', e); }
        // try { renderRankChart(data.cumulativeRankDistribution); } catch (e) { console.error('chart-rank error:', e); }

    }

    // ===== Realtime 렌더링 =====
    function renderRealtime(data) {
        elPurchaseCount.textContent = numberWithCommas(data.purchaseCount);
        elRecommendCount.textContent = numberWithCommas(data.recommendCount);
        // renderRecentList(elRecentPurchases, data.recentPurchases, 'purchaseAt');
        // renderRecentList(elRecentRecommends, data.recentRecommends, 'createdDate');
    }

    // ===== 차트: 구매빈도 TOP7 (Bar) =====
    function renderTopNumbersChart(items) {
        var ctx = document.getElementById('chart-top-numbers');
        var labels = items.map(function (i) { return i.number + '번'; });
        var values = items.map(function (i) { return i.count; });
        var rainbow = ['#FF0000', '#FF8C00', '#FFD700', '#32CD32', '#1E90FF', '#4169E1', '#8A2BE2'];
        var colors = rainbow.slice(0, items.length);

        if (chartTopNumbers) chartTopNumbers.destroy();
        chartTopNumbers = new Chart(ctx, {
            type: 'bar',
            data: { labels: labels, datasets: [{ data: values, backgroundColor: colors }] },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    }

    // ===== 차트: 구매 유형별 비율 (Doughnut) =====
    function renderStrategyChart(items) {
        var ctx = document.getElementById('chart-strategy');
        var labels = items.map(function (i) { return i.sourceType; });
        var values = items.map(function (i) { return i.count; });
        var palette = ['#4a90d9', '#50c878', '#ff7272', '#fbc400', '#b0d840', '#69c8f2', '#aaa'];

        if (chartStrategy) chartStrategy.destroy();
        chartStrategy = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{ data: values, backgroundColor: palette.slice(0, items.length) }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    // // ===== 차트: 최근 10회차 추이 (Line) =====
    // function renderTrendChart(purchaseTrend, recommendTrend) {
    //     var ctx = document.getElementById('chart-trend');
    //     var labels = purchaseTrend.map(function (i) { return i.drwNo + '회'; });
    //
    //     if (chartTrend) chartTrend.destroy();
    //     chartTrend = new Chart(ctx, {
    //         type: 'line',
    //         data: {
    //             labels: labels,
    //             datasets: [
    //                 {
    //                     label: '구매',
    //                     data: purchaseTrend.map(function (i) { return i.count; }),
    //                     borderColor: '#4a90d9',
    //                     backgroundColor: 'rgba(74,144,217,0.1)',
    //                     fill: true,
    //                     tension: 0.3
    //                 },
    //                 {
    //                     label: '추천',
    //                     data: recommendTrend.map(function (i) { return i.count; }),
    //                     borderColor: '#50c878',
    //                     backgroundColor: 'rgba(80,200,120,0.1)',
    //                     fill: true,
    //                     tension: 0.3
    //                 }
    //             ]
    //         },
    //         options: {
    //             responsive: true,
    //             plugins: { legend: { position: 'bottom' } },
    //             scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    //         }
    //     });
    // }

    // // ===== 차트: 누적 등수 분포 (Bar) =====
    // function renderRankChart(items) {
    //     var ctx = document.getElementById('chart-rank');
    //     var labels = items.map(function (i) { return i.resultRank === 0 ? '낙첨' : i.resultRank + '등'; });
    //     var values = items.map(function (i) { return i.count; });
    //     var colors = ['#fbc400', '#69c8f2', '#50c878', '#b0d840', '#aaa', '#ff7272'];
    //
    //     if (chartRank) chartRank.destroy();
    //     chartRank = new Chart(ctx, {
    //         type: 'bar',
    //         data: { labels: labels, datasets: [{ data: values, backgroundColor: colors.slice(0, items.length) }] },
    //         options: {
    //             responsive: true,
    //             plugins: { legend: { display: false } },
    //             scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    //         }
    //     });
    // }

    // ===== API 호출 =====
    function buildQuery() {
        return currentDrwNo ? '?drwNo=' + currentDrwNo : '';
    }

    function fetchSummary() {
        fetch('/dashboard/api/summary' + buildQuery())
            .then(function (res) { return res.json(); })
            .then(function (data) {
                console.log('fetchSummary 응답:', data);
                if (data.result) renderSummary(data);
            })
            .catch(function (err) { console.error('summary fetch error:', err); });
    }

    function fetchRealtime() {
        fetch('/dashboard/api/realtime' + buildQuery())
            .then(function (res) { return res.json(); })
            .then(function (data) {
                console.log('fetchRealtime 응답:', data);
                if (data.result) renderRealtime(data);
            })
            .catch(function (err) { console.error('realtime fetch error:', err); });
    }

    // ===== 초기화 =====
    fetchSummary();
    setInterval(fetchRealtime, 5000);
    setInterval(fetchSummary, 60000);
})();
