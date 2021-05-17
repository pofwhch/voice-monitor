/**
 * @fileoverview 프로그램 실행에 필요한 설정정보를 관리하는 Utility
 * @requires config.dev.json - 개발환경에 필요한 주요 설정정보
 * @requires config.prd.json - 상용환경에 필요한 주요 설정정보
 * @author suyong.choi
 */
const configDev = require("../configs/config.dev.json");
const configPrd = require("../configs/config.prd.json");

// nodejs 환경변수 값을 이용하여 개발용/상용 설정을 구분할 수 있다.
// 해당 환경변수는 pkg를 이용하여 바이너리 실행파일을 생성할 때는 적용되지 않으므로
// DEV 바이너리 실행파일을 생성하려면 아래 getConfig 함수에서 return 값을
// configDev 객체로 변경 후 build 하여야 한다. 
const config = process.env.NODE_ENV === "DEV" ? configDev : configPrd;

const getConfig = () => {
    return config;
    // return configDev; // 개발서버와 연동되는 실행파일 생성시 필요
}

module.exports = {getConfig};