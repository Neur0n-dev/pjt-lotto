/**
 * 로또 회차 엑셀 Import 스크립트
 *
 * superkts.com에서 다운로드한 엑셀 파일을 DB에 import
 *
 * 사용법:
 *   node scripts/import-draw-excel.js <엑셀파일경로>
 *
 * 예시:
 *   node scripts/import-draw-excel.js ./data/lotto.xlsx
 */

const XLSX = require('xlsx');
const db = require('../src/congif/db');

// 엑셀 파일 경로 (명령줄 인자)
const filePath = process.argv[2];

if (!filePath) {
    console.error('사용법: node scripts/import-draw-excel.js <엑셀파일경로>');
    process.exit(1);
}

/**
 * 엑셀 파일 파싱
 */
function parseExcel(filePath) {
    console.log(`엑셀 파일 읽는 중: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // JSON으로 변환
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`총 ${rows.length}행 발견`);
    console.log(`헤더: ${rows[0]}`);

    return rows;
}

/**
 * 회차 번호로 추첨일 계산
 * 1회차: 2002-12-07 (토요일), 이후 매주 토요일
 */
function calculateDrawDate(drwNo) {
    // 1회차 기준일: 2002-12-07
    const firstDrawDate = new Date('2002-12-07');

    // (회차 - 1) * 7일 더하기
    const drawDate = new Date(firstDrawDate);
    drawDate.setDate(firstDrawDate.getDate() + (drwNo - 1) * 7);

    const year = drawDate.getFullYear();
    const month = String(drawDate.getMonth() + 1).padStart(2, '0');
    const day = String(drawDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * 회차 데이터 추출
 * 엑셀 구조: 회차,번호1,번호2,번호3,번호4,번호5,번호6,보너스,...
 */
function extractDrawData(rows) {
    const draws = [];

    // 첫 행은 헤더로 가정
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        if (!row || row.length < 8) continue;

        // 컬럼 구조: [회차, 번호1, 번호2, 번호3, 번호4, 번호5, 번호6, 보너스, ...]
        const drwNo = parseInt(row[0], 10);

        if (isNaN(drwNo) || drwNo <= 0) continue;

        // 당첨번호 6개 (컬럼 1~6)
        const numbers = [];
        for (let j = 1; j <= 6; j++) {
            const num = parseInt(row[j], 10);
            if (!isNaN(num) && num >= 1 && num <= 45) {
                numbers.push(num);
            }
        }

        // 보너스 번호 (컬럼 7)
        const bonusNo = parseInt(row[7], 10);

        // 추첨일 계산
        const drwDate = calculateDrawDate(drwNo);

        if (numbers.length === 6 && bonusNo >= 1 && bonusNo <= 45) {
            draws.push({
                drwNo,
                drwDate,
                numbers,
                bonusNo
            });
        } else {
            console.warn(`행 ${i + 1} 파싱 실패:`, { drwNo, drwDate, numbers, bonusNo });
        }
    }

    return draws;
}

/**
 * DB에 저장
 */
async function saveToDatabase(draws) {
    console.log(`\n총 ${draws.length}개 회차 저장 시작...`);

    let successCount = 0;
    let errorCount = 0;

    for (const draw of draws) {
        try {
            // t_lotto_draw 저장
            await db.query(
                `INSERT INTO t_lotto_draw (drw_no, drw_date)
                 VALUES (?, ?) ON DUPLICATE KEY UPDATE drw_date = VALUES(drw_date)`,
                [draw.drwNo, draw.drwDate]
            );

            // t_lotto_draw_number 기존 데이터 삭제
            await db.query(
                'DELETE FROM t_lotto_draw_number WHERE drw_no = ?',
                [draw.drwNo]
            );

            // t_lotto_draw_number 저장
            const values = [];
            const placeholders = [];

            draw.numbers.forEach((number, index) => {
                values.push(draw.drwNo, index + 1, number);
                placeholders.push('(?, ?, ?)');
            });

            // 보너스 번호 (pos = 7)
            values.push(draw.drwNo, 7, draw.bonusNo);
            placeholders.push('(?, ?, ?)');

            await db.query(
                `INSERT INTO t_lotto_draw_number (drw_no, pos, number)
                 VALUES ${placeholders.join(', ')}`,
                values
            );

            successCount++;

            if (successCount % 100 === 0) {
                console.log(`  ${successCount}개 저장 완료...`);
            }

        } catch (err) {
            console.error(`회차 ${draw.drwNo} 저장 실패:`, err.message);
            errorCount++;
        }
    }

    console.log(`\n저장 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
}

/**
 * 메인 실행
 */
async function main() {
    try {
        // 1. 엑셀 파싱
        const rows = parseExcel(filePath);

        // 2. 데이터 추출
        const draws = extractDrawData(rows);
        console.log(`\n유효한 회차 데이터: ${draws.length}개`);

        if (draws.length > 0) {
            console.log(`첫 번째: ${draws[0].drwNo}회 (${draws[0].drwDate})`);
            console.log(`마지막: ${draws[draws.length - 1].drwNo}회 (${draws[draws.length - 1].drwDate})`);
        }

        // 3. DB 저장
        await saveToDatabase(draws);

        console.log('\n완료!');
        process.exit(0);

    } catch (err) {
        console.error('오류 발생:', err);
        process.exit(1);
    }
}

main();
