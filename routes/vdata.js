/**
 * @fileoverview STT Index Agent에 파일 검색 및 다운로드 요청을 처리하는 router
 * @requires express - 
 * @author suyong.choi
 */
const express = require('express');
const router = express.Router();

/* Get vdata Keep alive */
router.get('/', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] vdata router path : /`);
    res.send('vdata keep alive called');
});

/* Get pcm metadata list */
router.get('/pcminfos', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] vdata router path : /pcminfos`);
    res.send('vdata pcminfos called');
});

/* Get pcm info */
router.get('/pcm', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] vdata router path : /pcm`);
    res.send('vdata pcm called');
});

module.exports = router;