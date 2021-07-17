/**
 * @fileoverview Front 화면 제어를 위한 javasctipt file
 * @author suyong.choi
 */

/**
 * 데이터 원본의 datetime 정보는 모두 UTC Time으로 관리됨
 * 따라서 tabulator libarary formatter를 활용하여 local timezone으로 화면에 출력하기 위해 Default Timezone을 UTC로 설정
 * */
window.moment = moment;
moment.tz.setDefault('Etc/UTC');

const localPcmListUrl = "http://127.0.0.1:8080/vdata/pcminfos";
const localPcmUrl = "http://127.0.0.1:8080/vdata/pcm";

let table;
let histtable;
let wavesurfer;
let dialog;
let selectedCell;
let selectedRow;
let selectedRowInfo;

$(document).ready(function () {
    
    // Initialize datepicker and set default date
    $( "#dt_startDate" ).datepicker({ dateFormat: 'yy-mm-dd'}).datepicker("setDate", -1);
    $( "#dt_endDate" ).datepicker({ dateFormat: 'yy-mm-dd'}).datepicker("setDate", new Date());

    /* ================== START : PCM 파일 실행을 위한 모듈 생성 ================== */
    // create an instance of the global WaveSurfer object
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#69d7c3',
        progressColor: '#12463c',
        mediaControls: 'true',
        normalize: true
    });
    /* ================== END : PCM 파일 실행을 위한 모듈 생성 ================== */

    //Generate play icon
    const playIcon = function(cell, formatterParams){ 
        return "<a class='btn btn-xs btn-icon btn-circle'><i class='fa fa-3x fa-play-circle'></i></a>";
    };

    //Generate hist icon
    const histIcon = function(cell, formatterParams){ 
        return "<a class='btn btn-xs btn-icon btn-circle'><i class='fa fa-3x fa-list-ul'></i></a>";
    };

    //Generate memo icon
    const memoIcon = function(cell, formatterParams){ 
        return "<a class='btn btn-xs btn-icon btn-circle'><i class='fa fa-3x fa-pencil'></i></a>";
    };

    //Build Tabulator
    table = new Tabulator("#voice-table", {
        height:"495px",
        placeholder:"No Data Set",
        pagination:"local",
        paginationSize:10,
        paginationSizeSelector:[10, 20, 50],
        movableColumns:false,
        selectable:false, //make rows selectable
        downloadRowRange:"all",
        columns: [
            { title: '순번', formatter: "rownum", hozAlign: "center", vertAlign:"middle", width: 60, frozen:true, download:false },
            { title: '들어보기', formatter: playIcon, width:80, hozAlign:"center", vertAlign:"middle", cellClick: async (e, cell) => {
                selectedRowInfo = cell.getRow().getData();

                $('#la_sttResult').text(selectedRowInfo.sttResult);
                $('#la_filePath').text(selectedRowInfo.filePath);
                
                const params = $.param ({
                    sruId: selectedRowInfo.sruId,
                    filePath: selectedRowInfo.filePath
                });

                let response = await fetch(`${localPcmUrl}?${params}`);
                const responseJson = await response.json();

                if(responseJson.rc != 200){
                    alert("검색에 실패하였습니다.\nresMsg: " + responseJson.resMsg);
                    return;
                }

                /* ================== START : PCM 파일 실행기 생성 ================== */
                // change pcm data to Blob
                const pcmData = new Blob(fnMakeByteArrays(responseJson.resMsg.pcm));

                const buffer = await pcmData.arrayBuffer();
                const sampleRate = 16000;
                const numChannels = 1; // mono or stereo
                const [type, format] = [Uint8Array, 1];
                
                // create header (browser cannot deal with PCM format. So, wav is created by attaching header to pcm.
                const wavHeader = new Uint8Array(
                    fnBuildWaveHeader({
                        numFrames: buffer.byteLength / 2,
                        bytesPerSample: 2,
                        sampleRate,
                        numChannels,
                        format,
                    })
                );

                // create WAV file with header and downloaded PCM audio
                const wavBytes = new Uint8Array(wavHeader.length + buffer.byteLength);
                wavBytes.set(wavHeader, 0);
                wavBytes.set(new Uint8Array(buffer), wavHeader.length);

                // Blob 객체를 가르키는 URL을 (blob:URL) DOMString으로 생성
                const wavUrl = URL.createObjectURL(new Blob([wavBytes], { type: "audio/wav" }));

                /**
                 * WaveSurfer.load(url, peaks, preload) – Loads audio from URL via XHR. 
                 * Optional array of peaks.
                 * Optional preload parameter [none|metadata|auto], passed to the Audio element if using backend MediaElement.
                 * */
                wavesurfer.load(wavUrl);
                /* ================== END : PCM 파일 실행기 생성 ================== */

                // PCM Player 팝업 출력 및 음성 파일 실행
                $("#modal-message").dialog("open");

            }, frozen:true, download:false },
            { title: '발화이력', formatter: histIcon, width:80, hozAlign:"center", vertAlign:"middle", cellClick: async (e, cell) => {
                selectedRowInfo = cell.getRow().getData();
                let creationDate = selectedRowInfo.creationDate;
                
                $('#la_targetSttResult').text(selectedRowInfo.sttResult);
                $('#la_targetCreationDate').text(moment.tz(creationDate, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'));

                // 검색 시간을 선택한 데이터 생성시간 -2 ~ +2로 설정
                let startDate = new moment(creationDate).add(-2, 'h').toDate();
                let endDate = new moment(creationDate).add(2, 'h').toDate();
                
                const params = $.param ({
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString(),
                    deviceId: selectedRowInfo.deviceId,
                    deviceType: '',
                    searchWords: '',
                    searchType: '',
                    minConfidence: '',
                    maxConfidence: '',
                    minBayesRisk: '',
                    maxBayesRisk: ''
                });

                /* ================== START : Loading Overlay 처리 ================== */
                $("#voice-hist-table").LoadingOverlay("show", {
                    background  : "rgba(192,192,192,0.3)"
                });
                $("#voice-hist-table").LoadingOverlay("show");
                /* ================== END : Loading Overlay 처리 ================== */

                /* ================== START : 검색 결과 테이블 반영 ================== */
                let response = await fetch(`${localPcmListUrl}?${params}`);
                const responseJson = await response.json();

                $("#voice-hist-table").LoadingOverlay("hide", true);

                if(responseJson.rc != 200){
                    alert("발화이력 검색에 실패하였습니다.\nresMsg: " + responseJson.resMsg);
                    histtable.setData([]);
                    return;
                }

                histtable.setData(responseJson.resMsg);
                /* ================== END : 검색 결과 테이블 반영 ================== */

                // 발화이력 팝업 출력
                $("#modal-hist").dialog("open");
            }, frozen:true, download:false },
            { title: '메모하기', formatter: memoIcon, width:80, hozAlign:"center", vertAlign:"middle", cellClick: async (e, cell) => {
                selectedCell = cell;
                selectedRow = cell.getRow();
                selectedRowInfo = selectedRow.getData();

                $('#la_memoTargetSttResult').text(selectedRowInfo.sttResult);
                $('#la_memoTargetCreationDate').text(moment.tz(selectedRowInfo.creationDate, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'));

                /* ================== START : 기등록된 메모 정보 셋팅 ================== */
                $('#tx_memo').val(selectedRowInfo.memo == undefined ? '' : selectedRowInfo.memo);
                /* ================== END : 기등록된 메모 정보 셋팅 =================== */

                // 메모 팝업 출력
                $("#modal-memo").dialog("open");
            }, frozen:true , download:false},
            { title: '생성일자', field: 'creationDate', width: 140, hozAlign: "center", vertAlign:"middle",  frozen:true, formatter:"datetime",  
              formatterParams:{
                inputFormat: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]Z',
                outputFormat: 'YYYY-MM-DD HH:mm:ss',
                invalidPlaceholder: '(invalid date)',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}},
            { title: '단말 모델명', field: 'deviceType', width: 120, hozAlign: "center", vertAlign:"middle" },
            { title: '단말 아이디', field: 'deviceId', width: 180, hozAlign: "center", vertAlign:"middle", download:false },
            { title: '음성인식결과', field: 'sttResult', width: 300, hozAlign: "left", vertAlign:"middle", formatter:"textarea" },
            { title: '신뢰도', field: 'confidence', width: 80, hozAlign: "center", vertAlign:"middle",
              formatter:function(cell, formatterParams, onRendered) {
                // 소수 2째자리까지의 데이터만 출력되도록 처리
                return parseFloat(cell.getValue()).toFixed(2);
            }},
            { title: '베이즈위험', field: 'bayesRisk', width: 100, hozAlign: "center", vertAlign:"middle",
              formatter:function(cell, formatterParams, onRendered) {
                // 소수 2째자리까지의 데이터만 출력되도록 처리
                return parseFloat(cell.getValue()).toFixed(2);
            }},
            { title: 'SRU ID', field: 'sruId', width: 80, hozAlign: "center", vertAlign:"middle" },
            { title: '파일 경로', field: 'filePath', width: 500, hozAlign: "left", vertAlign:"middle", formatter:"textarea" },
            // { title: '파일명', field: 'fileName', width: 450, hozAlign: "left", vertAlign:"middle", formatter:"textarea" },
            { title: '메모', field: 'memo', width: 200, hozAlign: "center", vertAlign:"middle", visible: false, download:true }
        ],
        tooltips:true
    });

    // set default table data
    let tableData = [];
    table.setData(tableData);

    //Build histtable Tabulator
    histtable = new Tabulator("#voice-hist-table", {
        height:"315px",
        placeholder:"No Data Set",
        pagination:"local",
        paginationSize:10,
        paginationSizeSelector:[10, 20, 50],
        movableColumns:false,
        selectable:false, //make rows selectable
        columns: [
            { title: '순번', formatter: "rownum", hozAlign: "center", vertAlign:"middle", width: 60, frozen:true },
            { title: '생성일자', field: 'creationDate', width: 140, hozAlign: "center", vertAlign:"middle",  frozen:true, formatter:"datetime",     
              formatterParams:{
                inputFormat: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]Z',
                outputFormat: 'YYYY-MM-DD HH:mm:ss',
                invalidPlaceholder: '(invalid date)',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}},
            // { title: '단말 모델명', field: 'deviceType', width: 100, hozAlign: "center", vertAlign:"middle" },
            // { title: '단말 아이디', field: 'deviceId', width: 160, hozAlign: "center", vertAlign:"middle" },
            { title: '음성인식결과', field: 'sttResult', width: 320, hozAlign: "left", vertAlign:"middle", formatter:"textarea" },
            { title: '신뢰도', field: 'confidence', width: 80, hozAlign: "center", vertAlign:"middle",
              formatter:function(cell, formatterParams, onRendered) {
                // 소수 2째자리까지의 데이터만 출력되도록 처리
                return parseFloat(cell.getValue()).toFixed(2);
              }},
              { title: '베이즈위험', field: 'bayesRisk', width: 100, hozAlign: "center", vertAlign:"middle",
                formatter:function(cell, formatterParams, onRendered) {
                  // 소수 2째자리까지의 데이터만 출력되도록 처리
                  return parseFloat(cell.getValue()).toFixed(2);
              }},
            // { title: 'SRU ID', field: 'sruId', width: 80, hozAlign: "center", vertAlign:"middle" },
            // { title: '파일 경로', field: 'filePath', width: 500, hozAlign: "left", vertAlign:"middle", formatter:"textarea" },
            // { title: '파일명', field: 'fileName', width: 450, hozAlign: "left", vertAlign:"middle", formatter:"textarea" }
        ],
        tooltips:true
    });

    // set default histtable data
    histtable.setData([]);
    
    /* ================== START : 검색 영역 이벤트 처리 ================== */
    
    // DeviceId Input 요소에 엔터 키다운 이벤트 발생시 데이터 조회 처리
    $('#tx_deviceId').keydown(function (key) {
        if (key.keyCode == 13) {
            fnSearch();
        }
    });

    // 단말 모델명 Input 요소에 엔터 키다운 이벤트 발생시 데이터 조회 처리
    $('#tx_deviceType').keydown(function (key) {
        if (key.keyCode == 13) {
            fnSearch();
        }
    });

    // 검색어 Input 요소에 엔터 키다운 이벤트 발생시 데이터 조회 처리
    $('#tx_searchWords').keydown(function (key) {
        if (key.keyCode == 13) {
            fnSearch();
        }
    });

    // 신뢰점수 Input 요소에 엔터 키다운 이벤트 발생시 데이터 조회 처리
    $('#tx_maxConfidence').keydown(function (key) {
        if (key.keyCode == 13) {
            fnSearch();
        }
    });

    /* 조회 버튼 클릭시 이벤트 처리 */
    $('#btn_search').click(function() {
        fnSearch();
    });

    /* 다운로드 버튼 클릭시 이벤트 처리 */
    $('#btn_download').click(function() {
        if (table.getDataCount()) {
            let now = moment.tz(new Date(), 'Asia/Seoul').format('YYYYMMDD_HHmmss');
            table.download('csv', `voice_monitor_download_${now}.csv`)
        } else {
            alert("다운로드할 데이터가 존재하지 않습니다.\n먼저 데이터를 조회해주세요.")
        }
    });

    /* ================== END : 검색 영역 이벤트 처리 ================== */

    // PCM Player Dailog Component 선언
    dialog = $( "#modal-message" ).dialog({
        autoOpen: false,
        show: {
            effect: "fade",
            duration: 1000
        },
        height: 310,
        width: '98%',
        modal: true,
        close: function() {
            // 팝업창을 닫을 경우 오디오 실행을 종료하고 WaveSurfer 객체를 초기화한다,
            // destroy() – Removes events, elements and disconnects Web Audio nodes.
            // empty() – Clears the waveform as if a zero-length audio is loaded.
            wavesurfer.stop();
            wavesurfer.empty();
        }
    });

    // Play 버튼 클릭시 WAVE 파일 실행 처리
    document.getElementById('btn_play').addEventListener('click', async () => {
        wavesurfer.play();
    });

    // Pause 버튼 클릭시 WAVE 파일 실행 중단 처리
    document.getElementById('btn_pause').addEventListener('click', async () => {
        wavesurfer.pause();
    });

    // 발화이력 Dailog Component 선언
    dialog = $( "#modal-hist" ).dialog({
        autoOpen: false,
        show: {
            effect: "fade",
            duration: 1000
        },
        height: 410,
        width: 745,
        modal: true,
        close: function() {
            // 팝업창을 닫을 경우 발화 이력 데이터를 초기화한다,
            histtable.setData([]);
        }
    });

    // 메모 Dailog Component 선언
    dialog = $( "#modal-memo" ).dialog({
        autoOpen: false,
        show: {
            effect: "fade",
            duration: 1000
        },
        height: 220,
        width: 400,
        modal: true,
        close: function() {
            // 팝업창을 닫을 경우 메모 데이터를 저장한다,
            // selectedRow.update({"memo":$("#tx_memo").val()}); //update the row data for field "memo"
        }
    });
    
    /* 메모저장 버튼 클릭시 이벤트 처리 */
    $('#btn_memo_save').click(function() {
        if ($("#tx_memo").val() != '') {
            selectedRow.update({"memo":$("#tx_memo").val()}); //update the row data for field "memo"
            selectedCell.getElement().style.backgroundColor = "#ffce00";
        }

        $("#modal-memo").dialog("close");
    });
});

/**
 * 
 * @method
 * @returns {void} 
 */
async function fnSearch() {
    let startDate = $("#dt_startDate").val() + " " + $("#se_startTime").val();
    let endDate = $("#dt_endDate").val() + " " + $("#se_endTime").val();

    const params = $.param ({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        deviceId: $("#tx_deviceId").val(),
        deviceType: $("#tx_deviceType").val(),
        searchWords: $("#tx_searchWords").val(),
        searchType: $('#se_searchType').val(),
        minConfidence: $('#tx_minConfidence').val(),
        maxConfidence: $('#tx_maxConfidence').val(),
        minBayesRisk: $('#tx_minBayesRisk').val(),
        maxBayesRisk: $('#tx_maxBayesRisk').val()
    });

    /* ================== START : Loading Overlay 처리 ================== */
    $("#voice-table").LoadingOverlay("show", {
        background  : "rgba(192,192,192,0.3)"
    });
    $("#voice-table").LoadingOverlay("show");
    /* ================== END : Loading Overlay 처리 ================== */

    let response = await fetch(`${localPcmListUrl}?${params}`);
    const responseJson = await response.json();

    $("#voice-table").LoadingOverlay("hide", true);

    if(responseJson.rc != 200){
        alert("검색에 실패하였습니다.\nresMsg: " + responseJson.resMsg);
        table.setData([]);
        return;
    }

    table.setData(responseJson.resMsg);
}

// Base64 Data를 byte로 전환하는 함수
function fnMakeByteArrays (b64Data, contentType = "", sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    let byteArrays = [];

    let slice, byteNumbers;
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        slice = byteCharacters.slice (offset, offset + sliceSize);
        byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
    }

    return byteArrays;
}

// Wave File Header 정보 생성 함수
function fnBuildWaveHeader(opts) {
    const numFrames = opts.numFrames;
    const numChannels = opts.numChannels || 2;
    const sampleRate = opts.sampleRate || 44100;
    const bytesPerSample = opts.bytesPerSample || 2;
    const format = opts.format;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numFrames * blockAlign;

    const buffer = new ArrayBuffer(44);
    const dv = new DataView(buffer);
    let p = 0;
    function writeString(s) {
        for (let i = 0; i < s.length; i++) {
        dv.setUint8(p + i, s.charCodeAt(i));
        }
        p += s.length;
    }
    function writeUint32(d) {
        dv.setUint32(p, d, true);
        p += 4;
    }
    function writeUint16(d) {
        dv.setUint16(p, d, true);
        p += 2;
    }

    writeString("RIFF"); // ChunkID
    writeUint32(dataSize + 36); // ChunkSize
    writeString("WAVE"); // Format
    writeString("fmt "); // Subchunk1ID
    writeUint32(16); // Subchunk1Size
    writeUint16(format); // AudioFormat
    writeUint16(numChannels); // NumChannels
    writeUint32(sampleRate); // SampleRate
    writeUint32(byteRate); // ByteRate
    writeUint16(blockAlign); // BlockAlign
    writeUint16(bytesPerSample * 8); // BitsPerSample
    writeString("data"); // Subchunk2ID
    writeUint32(dataSize); // Subchunk2Size 

    return buffer;
}
