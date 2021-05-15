/**
 * @fileoverview API 서버와 통신하기 위한 암호화 Utility
 * @requires crypto - 
 * @requires getConfig - 전체 설정정보를 관리하는 모듈의 정보 제공 함수
 * @author suyong.choi
 */
const crypto = require("crypto");

const {getConfig} = require("../utils/config-util"); 
const config = getConfig();

/* HMAC 처리를 위한 기본 설정 정보를 셋팅 */
const algorithm = config.encryption.algorithm;
const apiKey = config.apiServer.apiKey;
const cryptoEncoding = config.encryption.cryptoEncoding;
const bufferEncoding = config.encryption.bufferEncoding;

/**
 * 현재 UTC 정보를 얻는다.
 * @returns String - UCT Timestamp value
 */
const getTimeStamp = () => {
  return new Date().toISOString();
};

/**
 * 
 * @param {*} timeStamp 
 * @param {*} queryString 
 * @returns 
 */
const getSignature = (timeStamp, queryString) => {
  let rawHmac = crypto.createHmac(algorithm, apiKey).update(timeStamp + queryString, cryptoEncoding).digest();
  return Buffer.from(rawHmac).toString(bufferEncoding);
};

module.exports = { getTimeStamp, getSignature };
