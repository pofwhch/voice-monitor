# Voice Monitor

STT Voice PCM 파일을 검색하고 직접 들으면서 품질 관리할 수 있는 모니터링 클라이언트 

---

### pkg를 활용한 Node.js 실행파일 생성하기 
pkg : Node실행 환경과 패키지를 모두 모아서 바로 실행할 수 있는(executable) 단 한 개의 파일을 만들어주는 바이너리 컴파일 도구  
  
**상용 서버와 연동되는 실행파일 생성 방법**
1. package.json 정보 확인 
```
"name" : "voice-monitor-{상용:p, 개발:d}_{버전 첫째자리수}_{버전 둘째자리수}"
```
2. /utils/config-util.js 확인 : return 값이 config 정보여야 함
```
const configDev = require("../configs/config.dev.json");
const configPrd = require("../configs/config.prd.json");

// package.json script 명령을 통해 실행할 경우 config 정보를 이용하여 개발용/상용 설정을 구분한다. 
const config = process.env.npm_package_config_file === "dev" ? configDev : configPrd;

const getConfig = () => {
    return config;
    // return configDev;
}
```
3. build
```
$ npm run build 
```
