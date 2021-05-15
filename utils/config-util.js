/**
 * @fileoverview 프로그램 실행에 필요한 설정정보를 관리하는 Utility
 * @requires config.dev.json - 개발환경에 필요한 주요 설정정보
 * @requires config.prd.json - 상용환경에 필요한 주요 설정정보
 * @author suyong.choi
 */
const configDev = require("../configs/config.dev.json");
const configPrd = require("../configs/config.prd.json");

// package.json script 명령을 통해 실행할 경우 config 정보를 이용하여 개발용/상용 설정을 구분할 수 있다.
// const config = process.env.npm_package_config_file === "dev" ? configDev : configPrd;
const config = process.env.NODE_ENV === "DEV" ? configDev : configPrd;

const getConfig = () => {
    return config;
    // return configDev; // 개발서버와 연동되는 실행파일 생성시 필요
}

module.exports = {getConfig};