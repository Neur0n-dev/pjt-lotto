var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerUi = require('swagger-ui-express');
var swaggerSpec = require('./src/config/swagger');

var drawRoutes = require('./src/modules/draw/draw.routes')
var purchaseRoutes = require('./src/modules/purchase/purchase.routes')
var recommendRoutes = require('./src/modules/recommend/recommend.routes')
var evaluateRoutes = require('./src/modules/evaluate/evaluate.routes')
var dashboardRoutes = require('./src/modules/dashboard/dashboard.routes')
var scheduler = require('./src/scheduler')
var {AppError} = require('./src/common/errors')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(logger(function (tokens, req, res) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return [
    timestamp,
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms -',
    tokens.res(req, res, 'content-length')
  ].join(' ');
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/draw', drawRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/recommend', recommendRoutes);
app.use('/evaluate', evaluateRoutes);
app.use('/dashboard', dashboardRoutes);

// 루트 → 대시보드 리다이렉트
app.get('/', (req, res) => res.redirect('/dashboard'));

// 번호추천 페이지
app.get('/pick', (req, res) => res.render('pick'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// API error handler
app.use(function (err, req, res, next) {
  // AppError인 경우 JSON 응답
  if (err instanceof AppError) {
    return res.status(err.status).json(err.toJSON());
  }

  // API 요청인 경우 JSON 에러 응답
  if (req.path.startsWith('/recommend') ||
      req.path.startsWith('/draw') ||
      req.path.startsWith('/purchase') ||
      req.path.startsWith('/evaluate') ||
      req.path.startsWith('/dashboard/api')) {
    return res.status(err.status || 500).json({
      result: false,
      code: err.code || 1003,
      message: err.message || '서버 내부 오류가 발생했습니다.'
    });
  }

  // 그 외 (view 렌더링)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// 스케줄러 시작
scheduler.startAll();

module.exports = app;
