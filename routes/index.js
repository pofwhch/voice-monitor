/**
 * @fileoverview 기본 uri path에 대한 요청 내용을 처리하는 router
 * @requires express 웹 애플리케이션 프레임워크
 * @author suyong.choi
 */
const express = require('express');
const router = express.Router();

// Get Voice Monitoring Home Page
router.get('/', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] index router path : /`);
    
    res.render('index');
});

module.exports = router;