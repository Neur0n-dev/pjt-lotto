/**
 * Environment Configuration
 *
 * 환경 변수(.env) 로딩 및 관리
 * 실행 환경(dev / prod)에 따른 설정 분기
 * process.env 접근을 이 파일로 중앙화
 *
 */

require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'lotto',
  },

  isDev() {
    return this.nodeEnv === 'dev';
  },

  isProd() {
    return this.nodeEnv === 'prod';
  },
};

module.exports = env;