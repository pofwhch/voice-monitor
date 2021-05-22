# Voice Monitor

STT Voice PCM 파일을 검색하고 직접 들으면서 품질 관리할 수 있는 모니터링 클라이언트로서
Node.js pkg 모듈을 활용하여 standalone 실행파일을 생성할 수 있다. 

pkg : Node실행 환경과 패키지를 모두 모아서 바로 실행할 수 있는(executable) 단 한 개의 파일을 만들어주는 바이너리 컴파일 도구

---

### Standalone 실행파일 생성하기 
사용자 사번별로 실행파일을 생성하므로 반드시 먼저 config 정보를 확인해야 한다.    
  
1. config userKey 확인 : config.prd.json, config.dev.json
```
{
    "userKey": "12345678",
    ...
}
```
2. package.json 정보 확인 
```
{
    "name" : "voice-monitor-{상용:p, 개발:d}_{버전 첫째자리수}_{버전 둘째자리수}_{버전 셋째자리수}-{사용자 사번}",
    ...
}
```
3. /utils/config-util.js 확인 : return 값이 config 정보여야 함
```
const configDev = require("../configs/config.dev.json");
const configPrd = require("../configs/config.prd.json");

// nodejs 환경변수 값을 이용하여 개발용/상용 설정을 구분할 수 있다.
// 해당 환경변수는 pkg를 이용하여 바이너리 실행파일을 생성할 때는 적용되지 않으므로
// DEV 바이너리 실행파일을 생성하려면 아래 getConfig 함수에서 return 값을
// configDev 객체로 변경 후 build 하여야 한다. 
const config = process.env.NODE_ENV === "DEV" ? configDev : configPrd;

const getConfig = () => {
    return config;
    // return configDev;
}
```
4. build
```
$ npm run build 
```
5. exec path에 실행파일이 생성된다. 
> 경로를 변경하고자 할 경우에는 build script의 --out-path 값을 원하는 path로 변경하면 된다.
<img src='/uploads/9aaded1afebd302d64644a584c9aa2b9/Screen_Shot_2021-05-22_at_1.02.41_PM.png'  width='300' height='370'>

### 주요 Npm 실행 script
```
"scripts": {
    "start": "node server.js",
    "test:mac": "export NODE_ENV=DEV && node server.js",
    "test:win": "set NODE_DEV=DEV && node server.js",
    "build": "pkg . --out-path exec"
  }
```
standalone 실행파일을 생성하지 않고 직접 실행할 경우에는
> 상용서버 연동 : ```$ npm run start```  
> 테스트서버 연동 : ```$ npm run test:mac``` or ```$ npm run test:win```

