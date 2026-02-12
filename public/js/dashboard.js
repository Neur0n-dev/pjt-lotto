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

    // Chart 인스턴스
    let chartTopNumbers = null;
    let chartStrategy = null;
    let chartAlgorithm = null;
    let chartTrend = null;
    let chartRank = null;

    // ===== 유틸 =====
    function numberWithCommas(n) {
        return n != null ? n.toLocaleString() : '-';
    }

    function removeSkeleton(el) {
        if (el) el.classList.remove('skeleton');
    }

    function removeChartSkeleton(canvasId) {
        var canvas = document.getElementById(canvasId);
        if (canvas) removeSkeleton(canvas.closest('.card-chart'));
    }

    function toggleEmptyState(canvasId, isEmpty) {
        var canvas = document.getElementById(canvasId);
        var emptyMsg = canvas.parentElement.querySelector('.empty-message');
        if (!emptyMsg) return;
        canvas.style.display = isEmpty ? 'none' : 'block';
        emptyMsg.style.display = isEmpty ? 'flex' : 'none';
    }

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

    // ===== 1행 카드 렌더링 =====
    function renderRow1(data) {
        currentDrwNo = data.drwNo;
        latestDrwNo = data.latestDrwNo || data.drwNo;

        // 헤더
        elTitle.textContent = data.drwNo + ' 회차';
        updateNavButtons();

        // 1행 카드 - skeleton 제거
        removeSkeleton(elTotalPurchases);
        removeSkeleton(elTotalRecommends);
        removeSkeleton(elTotalWins);
        removeSkeleton(elWinRate);
        elTotalPurchases.textContent = numberWithCommas(data.summary.totalPurchases);
        elTotalRecommends.textContent = numberWithCommas(data.summary.totalRecommends);
        elTotalWins.textContent = numberWithCommas(data.summary.totalWins);
        elWinRate.textContent = data.summary.winRate + '%';
    }

    // ===== 2행 차트 렌더링 =====
    function renderRow2(data) {
        removeChartSkeleton('chart-strategy');
        removeChartSkeleton('chart-algorithm');

        try { renderStrategyChart(data.purchaseSourceRatio); } catch (e) { console.error('chart-strategy error:', e); }
        try { renderAlgorithmChart(data.recommendAlgorithmRatio); } catch (e) { console.error('chart-algorithm error:', e); }
    }

    // ===== 3행 차트 렌더링 =====
    function renderRow3(data) {
        removeChartSkeleton('chart-top-numbers');
        removeChartSkeleton('chart-trend');
        removeChartSkeleton('chart-rank');

        try { renderTopNumbersChart(data.topPurchasedNumbers); } catch (e) { console.error('chart-top-numbers error:', e); }
        try { renderTrendChart(data.purchaseTrend, data.recommendTrend); } catch (e) { console.error('chart-trend error:', e); }
        try { renderRankChart(data.cumulativeRankDistribution); } catch (e) { console.error('chart-rank error:', e); }
    }

    // ===== Realtime 렌더링 =====
    function renderRealtime(data) {
        removeSkeleton(elPurchaseCount);
        removeSkeleton(elRecommendCount);
        elPurchaseCount.textContent = numberWithCommas(data.purchaseCount);
        elRecommendCount.textContent = numberWithCommas(data.recommendCount);
    }

    // ===== 차트: 구매빈도 TOP7 (Bar) =====
    function renderTopNumbersChart(items) {
        if (!items || items.length === 0) {
            if (chartTopNumbers) { chartTopNumbers.destroy(); chartTopNumbers = null; }
            toggleEmptyState('chart-top-numbers', true);
            return;
        }
        toggleEmptyState('chart-top-numbers', false);
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

    // ===== 차트: Doughnut 공통 팩토리 =====
    function renderDoughnutChart(canvasId, existingChart, labels, values, palette) {
        var ctx = document.getElementById(canvasId);
        if (existingChart) existingChart.destroy();
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{ data: values, backgroundColor: palette.slice(0, labels.length) }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    function renderStrategyChart(items) {
        if (!items || items.length === 0) {
            if (chartStrategy) { chartStrategy.destroy(); chartStrategy = null; }
            toggleEmptyState('chart-strategy', true);
            return;
        }
        toggleEmptyState('chart-strategy', false);
        chartStrategy = renderDoughnutChart(
            'chart-strategy', chartStrategy,
            items.map(function (i) { return i.sourceType; }),
            items.map(function (i) { return i.count; }),
            ['#4a90d9', '#50c878', '#ff7272', '#fbc400', '#b0d840', '#69c8f2', '#aaa']
        );
    }

    function renderAlgorithmChart(items) {
        if (!items || items.length === 0) {
            if (chartAlgorithm) { chartAlgorithm.destroy(); chartAlgorithm = null; }
            toggleEmptyState('chart-algorithm', true);
            return;
        }
        toggleEmptyState('chart-algorithm', false);
        chartAlgorithm = renderDoughnutChart(
            'chart-algorithm', chartAlgorithm,
            items.map(function (i) { return i.algorithm; }),
            items.map(function (i) { return i.count; }),
            ['#50c878', '#4a90d9', '#ff7272', '#fbc400', '#b0d840', '#69c8f2', '#aaa']
        );
    }

    // ===== 차트: 최근 7회차 추이 (Line) =====
    function renderTrendChart(purchaseTrend, recommendTrend) {
        if ((!purchaseTrend || purchaseTrend.length === 0) && (!recommendTrend || recommendTrend.length === 0)) {
            if (chartTrend) { chartTrend.destroy(); chartTrend = null; }
            toggleEmptyState('chart-trend', true);
            return;
        }
        toggleEmptyState('chart-trend', false);
        var ctx = document.getElementById('chart-trend');
        var labels = purchaseTrend.map(function (i) { return i.drwNo + '회'; });

        if (chartTrend) chartTrend.destroy();
        chartTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '구매',
                        data: purchaseTrend.map(function (i) { return i.count; }),
                        borderColor: '#4a90d9',
                        backgroundColor: 'rgba(74,144,217,0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: '추천',
                        data: recommendTrend.map(function (i) { return i.count; }),
                        borderColor: '#50c878',
                        backgroundColor: 'rgba(80,200,120,0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    }

    // ===== 차트: 누적 등수 분포 (Bar) =====
    function renderRankChart(items) {
        if (!items || items.length === 0) {
            if (chartRank) { chartRank.destroy(); chartRank = null; }
            toggleEmptyState('chart-rank', true);
            return;
        }
        toggleEmptyState('chart-rank', false);
        var ctx = document.getElementById('chart-rank');
        var labels = items.map(function (i) { return i.resultRank === 0 ? '낙첨' : i.resultRank + '등'; });
        var values = items.map(function (i) { return i.count; });
        var colors = ['#fbc400', '#69c8f2', '#50c878', '#b0d840', '#aaa', '#ff7272'];

        if (chartRank) chartRank.destroy();
        chartRank = new Chart(ctx, {
            type: 'bar',
            data: { labels: labels, datasets: [{ data: values, backgroundColor: colors.slice(0, items.length) }] },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    }

    // ===== API 호출 =====
    var row1Pending = false;
    var row2Pending = false;
    var row3Pending = false;
    var realtimePending = false;

    function buildQuery() {
        return currentDrwNo ? '?drwNo=' + currentDrwNo : '';
    }

    function fetchRow1() {
        if (row1Pending) return;
        row1Pending = true;
        fetch('/dashboard/api/summary/row1' + buildQuery())
            .then(function (res) { return res.json(); })
            .then(function (data) { if (data.result) renderRow1(data); })
            .catch(function (err) { console.error('row1 fetch error:', err); })
            .finally(function () { row1Pending = false; });
    }

    function fetchRow2() {
        if (row2Pending) return;
        row2Pending = true;
        fetch('/dashboard/api/summary/row2' + buildQuery())
            .then(function (res) { return res.json(); })
            .then(function (data) { if (data.result) renderRow2(data); })
            .catch(function (err) { console.error('row2 fetch error:', err); })
            .finally(function () { row2Pending = false; });
    }

    function fetchRow3() {
        if (row3Pending) return;
        row3Pending = true;
        fetch('/dashboard/api/summary/row3' + buildQuery())
            .then(function (res) { return res.json(); })
            .then(function (data) { if (data.result) renderRow3(data); })
            .catch(function (err) { console.error('row3 fetch error:', err); })
            .finally(function () { row3Pending = false; });
    }

    function fetchAllSummary() {
        fetchRow1();
        fetchRow2();
        fetchRow3();
    }

    function fetchRealtime() {
        if (realtimePending) return;
        realtimePending = true;
        fetch('/dashboard/api/realtime' + buildQuery())
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.result) renderRealtime(data);
            })
            .catch(function (err) { console.error('realtime fetch error:', err); })
            .finally(function () { realtimePending = false; });
    }

    // ===== 초기화 =====
    fetchAllSummary();
    fetchRealtime();

    var realtimeTimer = setInterval(fetchRealtime, 5000);
    var summaryTimer = setInterval(fetchAllSummary, 60000);

    // 페이지 비활성 시 폴링 중지, 활성 시 재개
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            clearInterval(realtimeTimer);
            clearInterval(summaryTimer);
        } else {
            fetchRealtime();
            fetchAllSummary();
            realtimeTimer = setInterval(fetchRealtime, 5000);
            summaryTimer = setInterval(fetchAllSummary, 60000);
        }
    });
})();
