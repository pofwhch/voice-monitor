/**
 * @fileoverview 음성 모니터링 로컬 서버를 실행하고 모니터링 기본 화면을 크롬 브라우즈에 출력
 * @requires path - 
 * @requires express - 
 * @requires ejs - 
 * @requires open - 
 * @author suyong.choi
 */
const path = require('path');

const express = require('express');
const ejs = require('ejs');
// const request = require('request');
const open = require('open');

/* Router 객체 선언 */
var indexRouter = require('./routes/index')
var vdataRouter = require('./routes/vdata');

/* Config 객체 선언 */
const {getConfig} = require("./utils/config-util"); 
const config = getConfig();

const PORT = config.localServer.port;
const HOSTNAME = config.localServer.hostName;

const app = express();

/* view engine setup */
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

/* Routing 분리하기 */
app.use('/', indexRouter);
app.use('/vdata', vdataRouter);

/* public 디렉토리 안의 정적 파일 제공울 위한 express.static 미들웨어 사용 */
app.use(express.static(path.join(__dirname, 'public')));

/* 로컬 웹서버 실행 및 chrome에 기본 페이지 호출 */
app.listen(PORT, async() => {
    console.log(`[${new Date().toISOString()}] Voice Moinitor listening on port ${PORT}`);
    await open(`${HOSTNAME}:${PORT}`);
});

/* catch uncaught exception */
process.on('uncaughtException', err => {
    console.error(`[${new Date().toISOString()}] There was an uncaught error`, err);
    process.exit(1);
});