/**
 * @fileoverview 
 * @requires express - 
 * @requires body-parser - 
 * @requires ejs - 
 * @requires request - 
 * @requires open - 
 * @author suyong.choi
 */

const express = require('express');
// const bodyParser = require('body-parser');
// const ejs = require('ejs');
// const request = require('request');
// const open = require('open');

const PORT = process.env.PORT || 3000;

/**
 * Router 객체 선언
 */
var indexRouter = require('./routes/index')
var vdataRouter = require('./routes/vdata');

const app = express();

/* view engine setup */
app.set();

/**
 * Routing 분리하기
 */
app.use('/', indexRouter);
app.use('/vdata', vdataRouter);

app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Voice Moinitor listening on port ${PORT}`);
});

/* catch uncaught exception */
process.on('uncaughtException', err => {
    console.error(`[${new Date().toISOString()}] There was an uncaught error`, err);
    process.exit(1);
});