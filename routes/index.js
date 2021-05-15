/**
 * @fileoverview 기본 uri path에 대한 요청 내용을 처리하는 router
 * @requires express - 
 * @author suyong.choi
 */
const express = require('express');
const router = express.Router();

// Get Voice Monitoring Home Page
router.get('/', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] index router path : /`);
    // res.send('index.js / path called');
    
    res.render('index');
});

module.exports = router;