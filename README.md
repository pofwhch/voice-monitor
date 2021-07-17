# Voice Monitor

STT Voice PCM 파일을 검색하고 직접 들으면서 품질 관리할 수 있는 모니터링 클라이언트로서
Node.js pkg 모듈을 활용하여 standalone 실행파일을 생성할 수 있다. 

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

### 주요 활용 Library

1. express - 모니터링 클라이언트 앱의 Web Application Framework  
https://www.npmjs.com/package/express
2. pkg - Node실행 환경과 패키지를 모두 모아서 바로 실행할 수 있는(executable) 파일을 만들어주는 바이너리 컴파일 도구  
https://www.npmjs.com/package/pkg
3. ejs - html template 엔진으로 ejs를 이용할 경우 html 코드안에 javascript 코드를 삽일할 수 있다.  
https://www.npmjs.com/package/ejs
4. open - 프로그램이 최초 실행될 때 자동으로 웹페이지에 화면을 출력하기 위해 활용된 Node Module  
https://www.npmjs.com/package/open
5. tablulator - 화면 테이블 UI 구성에 활용된 Javascript library  
http://tabulator.info/
5. waversurfer.js - 화면 음성파일 출력 UI 구성 활용된 Javascript library  
https://wavesurfer-js.org/
6. moment.js - timezone 설정 및 데이터 전환을 위한 Javascritp library  
https://momentjs.com/

### package 설명
```  
|-- configs : 주요 애플리케이션 설정정보 관리 경로
|-- exec : build 시 바이너리 실행파일 생성 경로
|-- public : 정적인 코드 관리 경로
    |-- assets : UI 구성에 필요한 기본 컴포넌트 (아이콘, 버튼 등) 활용 소스
    |-- css : stylesheet 파일 경로
    |-- js : javascript 파일 경로
|-- routes : 라우팅 파일 경로 
|-- utils : config 제어, 암호화 등 utility 코드 관리 경로 
|-- views : 템플릿 파일 경로 
```