/**
 * @fileoverview STT Index Agent에 파일 검색 및 다운로드 요청을 처리하는 router
 * @requires express 웹 애플리케이션 프레임워크
 * @requires axios HTTP 비동기 통신 라이브러리
 * @author suyong.choi
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');

const {getTimeStamp, getSignature} = require("../utils/hmac-util"); 
const {getConfig} = require("../utils/config-util"); 
const config = getConfig();

/* Get vdata Keep alive */
router.get('/', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] vdata router path : /`);
    res.send('vdata keep alive called');
});

/* Get pcm metadata list */
router.get('/pcminfos', async(req, res, next) => {
    console.log(`[${new Date().toISOString()}][/pcminfos] request parameters : ${JSON.stringify(req.query)}`);
    // console.log(`[${new Date().toISOString()}][/pcminfos] decoded request parameters : ${decodeURIComponent(req.url.split("/pcminfos?")[1])}`);
    
    let timestamp = getTimeStamp();
    let signature = getSignature(timestamp, req.url.split("/pcminfos?")[1]);
    // console.log(`[${new Date().toISOString()}][/pcminfos] timestamp : ${timestamp}`);
    // console.log(`[${new Date().toISOString()}][/pcminfos] signature : ${signature}`);
    
    try {
        let {data, status} = await axios({
            method: "get",
            // signature에 적용된 파라미터 정보와 실제 전달된 파라미터 정보가 일치해야 하므로
            // param 속성을 이용하지 않고 uri endoding 정보를 그대로 활용한다.
            url: `/vdata/pcminfos?${req.url.split("/pcminfos?")[1]}`,
            baseURL: config.apiServer.hostName + ':' + config.apiServer.port,
            // 서버에 전송될 사용자 정의 헤더
            headers: {
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Signature': signature,
                "User-Key": config.userKey
            },
            timeout: config.apiServer.timeout,
            responseType: 'json'
        });
        
        // console.log(`[${new Date().toISOString()}][/pcminfos] status : ${JSON.stringify(status)}`);
        // console.log(`[${new Date().toISOString()}][/pcminfos] result : ${JSON.stringify(data)}`);

        return res.status(status).json(data).end();
    } catch (err) {
        console.log(`[${new Date().toISOString()}][/pcminfos] error : ${JSON.stringify(err)}`);
        let errStatus;
        let errData;
        if (err.response) {
            errStatus = err.response.data.rc;
            errData = {
                rc: errStatus,
                resMsg: err.response.data.message
            }
        } else {
            errStatus = 500;
            errData = {
                rc: 500,
                resMsg: "Unknown Error Occured"
            }
        }
        return res.status(errStatus).json(errData).end(); 
    }
});

/* Get pcm info */
router.get('/pcm', async(req, res, next) => {
    console.log(`[${new Date().toISOString()}][/pcm] request parameters ${JSON.stringify(req.query)}`);
    // console.log(`[${new Date().toISOString()}][/pcm] request parameters ${req.url.split("/pcm?")[1]}`);
    
    let timestamp = getTimeStamp();
    let signature = getSignature(timestamp, req.url.split("/pcm?")[1]);
    // console.log(`[${new Date().toISOString()}][/pcm] timestamp : ${timestamp}`);
    // console.log(`[${new Date().toISOString()}][/pcm] signature : ${signature}`);
    
    try {
        let {data, status} = await axios({
            method: "get",
            url: `/vdata/pcm?${req.url.split("/pcm?")[1]}`,
            baseURL: config.apiServer.hostName + ':' + config.apiServer.port,
            // 서버에 전송될 사용자 정의 헤더
            headers: {
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Signature': signature,
                "User-Key": config.userKey
            },
            timeout: config.apiServer.timeout,
            responseType: 'json'
        });
        
        // console.log(`[${new Date().toISOString()}][/pcminfos] status : ${JSON.stringify(status)}`);
        // console.log(`[${new Date().toISOString()}][/pcm] result : ${JSON.stringify(data)}`);

        return res.status(status).json(data).end();
    } catch (err) {
        console.log(`[${new Date().toISOString()}][/pcm] error : ${JSON.stringify(err)}`);
        let errStatus;
        let errData;
        if (err.response) {
            errStatus = err.response.data.rc;
            errData = {
                rc: errStatus,
                resMsg: err.response.data.message
            }
        } else {
            errStatus = 500;
            errData = {
                rc: 500,
                resMsg: "Unknown Error Occured"
            }
        }
        return res.status(errStatus).json(errData).end(); 
    }
});

module.exports = router;