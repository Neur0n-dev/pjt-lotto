const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Lotto API',
            version: '1.0.0',
            description: '로또 번호 추천 API - 전략 기반 번호 생성, 구매 관리, 당첨 평가'
        },
        servers: [
            { url: 'http://localhost:3000', description: '로컬 서버' }
        ],
        tags: [
            { name: 'Draw', description: '회차 정보 조회 및 동기화' },
            { name: 'Recommend', description: '전략 기반 번호 추천' },
            { name: 'Purchase', description: '구매(가상) 관리' },
            { name: 'Evaluate', description: '추천/구매 당첨 평가' }
        ],
        // components: {
        //     schemas: {
        //         // Common
        //         ErrorResponse: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: false },
        //                 code: { type: 'integer', example: 2002 },
        //                 message: { type: 'string', example: '회차 정보를 찾을 수 없습니다. (9999회)' }
        //             }
        //         },
        //         ValidationErrorResponse: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: false },
        //                 code: { type: 'integer', example: 1001 },
        //                 message: { type: 'string', example: '유효하지 않은 파라미터입니다.' },
        //                 errors: {
        //                     type: 'array',
        //                     items: { type: 'string' },
        //                     example: ['strategy는 필수 값입니다.', 'count는 1 이상 5 이하만 가능합니다.']
        //                 }
        //             }
        //         },
        //         LottoTicket: {
        //             type: 'array',
        //             items: { type: 'integer', minimum: 1, maximum: 45 },
        //             minItems: 6,
        //             maxItems: 6,
        //             example: [3, 11, 18, 25, 33, 42]
        //         },
        //
        //         // Draw
        //         DrawInfo: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 drwNo: { type: 'integer', example: 1208 },
        //                 drwDate: { type: 'string', example: '2026-01-24 00:00:00' },
        //                 createdDate: { type: 'string', example: '2026-01-24 21:20:00' }
        //             }
        //         },
        //         DrawSyncResponse: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 message: { type: 'string', example: '1208회차 동기화 완료' },
        //                 data: {
        //                     type: 'object',
        //                     properties: {
        //                         drwNo: { type: 'integer', example: 1208 },
        //                         drwDate: { type: 'string', example: '2026-01-24' },
        //                         numbers: {
        //                             type: 'array',
        //                             items: { type: 'integer' },
        //                             example: [3, 11, 18, 25, 33, 42]
        //                         },
        //                         bonusNo: { type: 'integer', example: 7 }
        //                     }
        //                 }
        //             }
        //         },
        //
        //         // Recommend
        //         RecommendCreateResponse: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 recommendId: { type: 'string', format: 'uuid' },
        //                 strategy: { type: 'string', example: 'random' },
        //                 count: { type: 'integer', example: 1 },
        //                 targetDrwNo: { type: 'integer', example: 1208 },
        //                 tickets: {
        //                     type: 'array',
        //                     items: { $ref: '#/components/schemas/LottoTicket' }
        //                 }
        //             }
        //         },
        //         RecommendDetail: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 recommendId: { type: 'string', format: 'uuid' },
        //                 targetDrwNo: { type: 'integer', example: 1208 },
        //                 algorithm: { type: 'string', example: 'random' },
        //                 params: { type: 'object' },
        //                 createdDate: { type: 'string', example: '2026-01-24 12:00:00' },
        //                 tickets: {
        //                     type: 'array',
        //                     items: { $ref: '#/components/schemas/LottoTicket' }
        //                 }
        //             }
        //         },
        //         RecommendListResponse: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 items: {
        //                     type: 'array',
        //                     items: {
        //                         type: 'object',
        //                         properties: {
        //                             recommendId: { type: 'string', format: 'uuid' },
        //                             targetDrwNo: { type: 'integer', example: 1208 },
        //                             algorithm: { type: 'string', example: 'random' },
        //                             params: { type: 'object' },
        //                             createdDate: { type: 'string', example: '2026-01-24 12:00:00' }
        //                         }
        //                     }
        //                 },
        //                 pagination: {
        //                     type: 'object',
        //                     properties: {
        //                         total: { type: 'integer', example: 50 }
        //                     }
        //                 }
        //             }
        //         },
        //
        //         // Purchase
        //         PurchaseCreateResponse: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 targetDrwNo: { type: 'integer', example: 1208 },
        //                 sourceType: { type: 'string', example: 'MANUAL' },
        //                 purchaseAt: { type: 'string', example: '2026-01-24 12:00:00' },
        //                 count: { type: 'integer', example: 1 },
        //                 purchaseIds: {
        //                     type: 'array',
        //                     items: { type: 'string', format: 'uuid' }
        //                 }
        //             }
        //         },
        //         PurchaseDetail: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 purchaseId: { type: 'string', format: 'uuid' },
        //                 targetDrwNo: { type: 'integer', example: 1208 },
        //                 purchaseAt: { type: 'string', example: '2026-01-24 12:00:00' },
        //                 sourceType: { type: 'string', example: 'MANUAL' },
        //                 createdDate: { type: 'string', example: '2026-01-24 12:00:00' },
        //                 numbers: {
        //                     type: 'array',
        //                     items: { type: 'integer', minimum: 1, maximum: 45 },
        //                     example: [3, 11, 18, 25, 33, 42]
        //                 }
        //             }
        //         },
        //         PurchaseListResponse: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 items: {
        //                     type: 'array',
        //                     items: {
        //                         type: 'object',
        //                         properties: {
        //                             purchaseId: { type: 'string', format: 'uuid' },
        //                             targetDrwNo: { type: 'integer', example: 1208 },
        //                             purchaseAt: { type: 'string', example: '2026-01-24 12:00:00' },
        //                             sourceType: { type: 'string', example: 'MANUAL' },
        //                             createdDate: { type: 'string', example: '2026-01-24 12:00:00' }
        //                         }
        //                     }
        //                 },
        //                 pagination: {
        //                     type: 'object',
        //                     properties: {
        //                         total: { type: 'integer', example: 50 }
        //                     }
        //                 }
        //             }
        //         },
        //
        //         // Evaluate
        //         EvaluateRecommendResponse: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 drwNo: { type: 'integer', example: 1208 },
        //                 recommend: {
        //                     type: 'array',
        //                     items: { type: 'object' }
        //                 },
        //                 recommendRankStatistics: {
        //                     type: 'array',
        //                     items: {
        //                         type: 'object',
        //                         properties: {
        //                             rank: { type: 'integer', example: 5 },
        //                             count: { type: 'integer', example: 10 }
        //                         }
        //                     }
        //                 }
        //             }
        //         },
        //         EvaluatePurchaseResponse: {
        //             type: 'object',
        //             properties: {
        //                 result: { type: 'boolean', example: true },
        //                 drwNo: { type: 'integer', example: 1208 },
        //                 purchase: {
        //                     type: 'array',
        //                     items: { type: 'object' }
        //                 },
        //                 purchaseRankStatistics: {
        //                     type: 'array',
        //                     items: {
        //                         type: 'object',
        //                         properties: {
        //                             rank: { type: 'integer', example: 5 },
        //                             count: { type: 'integer', example: 10 }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    },
    apis: ['./src/modules/*/*.routes.js']
};

module.exports = swaggerJsdoc(options);
