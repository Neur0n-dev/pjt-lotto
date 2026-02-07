const { randomStrategy } = require('./random.strategy');
const { evenOddStrategy } = require('./evenOdd.strategy');
const { sumRangeStrategy } = require('./sumRange.strategy');
const { frequencyStrategy } = require('./frequency.strategy');
const { hotColdStrategy } = require('./hotCold.strategy');

// 전략 관련 맵
const STRATEGY_MAP = {
    random: {
        key: 'random',
        desc: '랜덤 추천(고정번호 포함/제외번호 반영)',
        execute: (fixedNumbers, excludeNumbers) => randomStrategy(fixedNumbers, excludeNumbers),
    },

    evenOdd: {
        key: 'evenOdd',
        desc: '홀짝 3:3 밸런스 전략',
        execute: (fixedNumbers, excludeNumbers) => evenOddStrategy(fixedNumbers, excludeNumbers),
    },

    sumRange: {
        key: 'sumRange',
        desc: '합계 범위를 지정하는 전략',
        execute: (fixedNumbers, excludeNumbers) => sumRangeStrategy(fixedNumbers, excludeNumbers),
    },

    frequency: {
        key: 'frequency',
        desc: '최근 50회차 출현 빈도 기반 가중 랜덤 전략',
        execute: (fixedNumbers, excludeNumbers) => frequencyStrategy(fixedNumbers, excludeNumbers),
    },

    hotCold: {
        key: 'hotCold',
        desc: '핫(자주 출현) 4개 + 콜드(출현 적음) 2개 조합 전략',
        execute: (fixedNumbers, excludeNumbers) => hotColdStrategy(fixedNumbers, excludeNumbers),
    }
};

function getStrategyNames() {
    return Object.keys(STRATEGY_MAP);
}

function hasStrategy(strategy) {
    return strategy === 'all' || Boolean(STRATEGY_MAP[strategy]);
}

module.exports = {
    STRATEGY_MAP,
    getStrategyNames,
    hasStrategy,
};
