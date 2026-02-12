// 전략 버튼 클릭 → 버튼 active 전환 + 설명 전환
document.querySelectorAll('.btn-strategy').forEach(btn => {
    btn.addEventListener('click', () => {
        const strategy = btn.dataset.strategy;

        // 버튼 active 전환
        document.querySelector('.btn-strategy.active').classList.remove('active');
        btn.classList.add('active');

        // 설명 active 전환
        document.querySelector('.strategy-desc.active').classList.remove('active');
        document.querySelector(`.strategy-desc[data-strategy="${strategy}"]`).classList.add('active');
    });
});
