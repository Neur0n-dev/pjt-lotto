var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var drawRoutes = require('./src/modules/draw/draw.routes')
var purchaseRoutes = require('./src/modules/purchase/purchase.routes')
var recommendRoutes = require('./src/modules/recommend/recommend.routes')
var evaluateRoutes = require('./src/modules/evaluate/evaluate.routes')
var scheduler = require('./src/scheduler')
var {AppError} = require('./src/common/errors')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/draw', drawRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/recommend', recommendRoutes);
app.use('/evaluate', evaluateRoutes);

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
      req.path.startsWith('/evaluate')) {
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
