import React from "react";
import axios from "axios";


const GDM_SERVER = "https://api-gdm.icared.co.kr";
const INNERWARE_SERVER = "https://gdm.surfinn.kr/ifObgynGdm";


const trim = (value) => {  return value.replace(/^\s+|\s+$/g, ""); };
const focus = (msg, obj) => {  alert(msg);  obj.focus(); };
const validationAlNum = (str) => { const regex = /^[A-Za-z0-9+]*$/;  return regex.test(str);};
const validationAl = (str) => { const regex = /^[A-Za-z+]*$/; return regex.test(str); };
const validationNum = (str) => { const regex = /^[0-9+]*$/; return regex.test(str); };
const getObject = (id) => {  return document.getElementById(id);};

const getFormatDate= (date) => {
  const year = date.getFullYear();
  let month = (1 + date.getMonth());
  month = month >= 10 ? month : '0' + month;
  let day = date.getDate();
  day = day >= 10 ? day : '0' + day;
  return year + '-' + month + '-' + day;
}


/**
 * 소수점 입력했을때 점 빼고 앞 숫자만 리턴.
 * @param {*} value 
 */
const getOnlyNumber = (value) => {
  if(validationNum(value)) return value;
  else return value.replace('.','');
}


/**
 * bmi 계산하기
 * @param {*} height 
 * @param {*} weight 
 * @returns 소수점 둘째자리까지 구함.
 */
const getBmi = (height, weight) => {
  const result = (weight / ((height * height) / 10000)).toFixed(2);

  return result;
}


/**
 * 버튼 id값을 입력받아, yes, no, 모름 버튼 3개 모두의 active상태 classname을 초기화.
 * @param {*} value : 변수 명
 * @param {*} object : 클릭된 버튼 object 
 */
const onChangeButtonState = (value, object) => {
  document.getElementById(value + 'Y').className = '';
  document.getElementById(value + 'N').className = '';
  document.getElementById(value + 'DK').className = '';
  object.className = 'active';
}



/**
 * 기준일에서 nNum을 빼거나 더한 날짜 구하기.
 * @param {*} tday : 기준일
 * @param {*} nNum : 음수, 양수 모두 받음.
 * @param {*} type : "d" or "m" or "y"
 * @returns 
 */
const datePlusMinus = (tday, nNum, type) => {
  let yy = parseInt(tday.substr(0, 4), 10);
  let mm = parseInt(tday.substr(5, 2), 10);
  let dd = parseInt(tday.substr(8), 10);

  let dt;
  if (type === "d") {
    dt = new Date(yy, mm - 1, dd + nNum);
  } else if (type === "m") {
    dt = new Date(yy, mm - 1, dd + nNum * 31);
  } else if (type === "y") {
    dt = new Date(yy + nNum, mm - 1, dd);
  }

  yy = dt.getFullYear();
  mm = dt.getMonth() + 1;
  mm = mm < 10 ? "0" + mm : mm;
  dd = dt.getDate();
  dd = dd < 10 ? "0" + dd : dd;

  return yy + "-" + mm + "-" + dd;
};


/**
 * 입력된 숫자가 제한 범위에 들어가는지 여부 확인
 */
const checkNumberRage = (value, min, max) => {
  const fValue = parseFloat(value);
  const fMin = parseFloat(min);
  const fMax = parseFloat(max);

  return (fMin <= fValue && fValue <= fMax) ? true:false;
}


/**
 * 소수점 밑으로 정해진 자릿수 이상은 받지 않도록 체크함.
 * @param {*} value 
 * @param {*} num 
 */
const checkNumberPoint = (value, num) => {
  const arr = value.split(".");

  // 입력된 수치가 소수점이 있을 경우
  if(arr.length > 1){;
    if(arr[1] === '') return value;
    else{ 
      const tm = arr[1].substr(0,num); 
      return arr[0] + '.' + tm;
    }
  }else return value;
}





const Prediction = () => {
  // ****** 화면 콘트롤을 위한 변수들 
  const [isE0, setIsE0] = React.useState(true);  // E0 or M1. 디폴트는 E0.

  // ******  입력항목 변수들
  // 기본항목
  const [ date, setDate] = React.useState(getFormatDate(new Date()));
  const [ hospital, setHospital] = React.useState("");                          // 병원
  const [ idCode, setIdCode] = React.useState("");                              // 식별번호
  const [ motherAge, setMotherAge] = React.useState("");                        // 산모나이
  const [ crntGestWeeksW, setCrntGestWeeksW] = React.useState("");                // 임신주수 (주)
  const [ crntGestWeeksD, setCrntGestWeeksD] = React.useState("");                // 임신주수 (일)
  const [ edc, setEdc] = React.useState("0000-00-00");                           // edc
  const [ gestCnt, setGestCnt] = React.useState("");                              // 과거임신횟수
  const [ birthCnt, setBirthCnt] = React.useState("");                            // 출산횟소 (???? 화면에 없음. 계산식 요청.)
  const [ ftpn, setFtpn] = React.useState("");                                    // 만삭분만횟수
  const [ pbmh, setPbmh] = React.useState("");                                    // 조산력
  // const [ mcCnt, setMcCnt] = React.useState("");                                // 유산 횟수
  const [ naturalMcCnt, setNaturalMcCnt] = React.useState("");                    // 유산 횟수(자연)
  const [ artificialMcCnt, setArtificialMcCnt] = React.useState("");              // 유산 횟수(인공)

  // 기본 하위항목
  const [ twinKind, setTwinKind] = React.useState("");                           // 현재 임신중인 아기의 수  
  const [ motherOriginalWeight, setMotherOriginalWeight] = React.useState("");   // 임신 전 체중
  const [ motherHeight, setMotherHeight] = React.useState("");                   // 임신 전 키
  const [ motherOriginalBmi, setMotherOriginalBmi] = React.useState("");         // 임신 전 BMI
  const [ sbp, setSbp] = React.useState("");                                      // 최고혈압
  const [ dbp, setDbp] = React.useState("");                                      // 최고혈압
  const [ hr, setHr] = React.useState("");                                        // 맥박
  const [ map, setMap] = React.useState("");                                      // MAP
  const [ smoking, setSmoking] = React.useState("");                              // 흡연여부
  const [ vpgDur, setVpgDur] = React.useState("");                                // 프로게스테론

  // 경산모 항목
  const [ survch, setSurvch] = React.useState("");                                // 생존아 수
  const [ csec, setCsec] = React.useState("");                                    // 제왕절개 수술 횟수
  const [ prevPrevia, setPrevPrevia] = React.useState("");                        // 전치태반
  const [ prevGestDm, setPrevGestDm] = React.useState("");                        // 이전 임신 임신성 당뇨 과거력
  const [ prevLga, setPrevLga] = React.useState("");                              // 거대아 분만력


  // 과거력
  const [ phxCycle, setPhxCycle] = React.useState("");                            // 고혈압 질환 과거력
  const [ igt, setIgt] = React.useState("");                                      // IGT. 인슐린저항성관련질환(당뇨전단계)
  const [ hylipidc, setHylipidc] = React.useState("");                            // 고지혈증
  const [ enoth, setEnoth] = React.useState("");                                  // 기타 내분비질환 여부 (Y, N, DK)
  const [ enothName, setEnothName] = React.useState("");                          // 기타 내분비질환명
  const [ admDigest, setAdmDigest] = React.useState("");                          // 소화기계 질환 과거력 또는 임신중 소화기계질환 진단여부 여부 (Y, N, DK)
  const [ admDigestName, setAdmDigestName] = React.useState("");                  // 소화기계 질환명
  const [ admBlood, setAdmBlood] = React.useState("");                            // 혈액질환 과거력 여부 (Y, N, DK)
  const [ admBloodName, setAdmBloodName] = React.useState("");                    // 혈액질환명
  const [ immune, setImmune] = React.useState("");                                // 면역질환 여부 (Y, N, DK)
  const [ immuneDur, setImmuneDur] = React.useState("");                          // 면역질환 과거력(기간)
  const [ immuneDurName, setImmuneDurName] = React.useState("");                  // 면역질환 과거력(질환명)
  const [ phxSkin, setPhxSkin] = React.useState("");                              // 피부질환 과거력 여부 (Y, N, DK)
  const [ phxSkinName, setPhxSkinName] = React.useState("");                      // 피부질환명
  const [ myomano, setMyomano] = React.useState("");                              // 자궁근종개수
  const [ pcos, setPcos] = React.useState("");                                    // 다낭성난소
  const [ phxOvarian, setPhxOvarian] = React.useState("");                        // 난소 혹 진단과거력


  // 가족력 항목
  const [ fhxDm, setFhxDm] = React.useState("");                                  // 당뇨 질환가족력
  const [ fhxHtm, setFhxHtm] = React.useState("");                                // 고혈압 가족력
  
  
  
  // 혈액검사결과
  const [ hb, setHb] = React.useState("");                                        // HB
  const [ wbc, setWbc] = React.useState("");                                      // WBC
  const [ hct, setHct] = React.useState("");                                      // HCT
  const [ plt, setPlt] = React.useState("");                                      // PLT


  // BC
  const [ gfr, setGfr] = React.useState("");                                      // 사구체여과율
  const [ tc, setTc] = React.useState("");                                        // TC (total cholesterol)
  const [ hdl, setHdl] = React.useState("");                                      // HDL (cholesterol)
  const [ ast, setAst] = React.useState("");                                      // AST
  const [ alt, setAlt] = React.useState("");                                      // ALT

  // 혈당검사 
  const [ fasting100, setFasting100] = React.useState("");                        // 100g fasting. FBS
  const [ ogtt50, setOgtt50] = React.useState("");                                // 50g GTT
  const [ glucose, setGlucose] = React.useState("");                              // randome glucose
  const [ hba1c, setHba1c] = React.useState("");                                  // HbA1C

  // 태아스크리닝
  const [ hcg, setHcg] = React.useState("");                                      // HCG
  const [ pappa, setPappa] = React.useState("");                                  // PAPPA

  
  const [ result, setResult] = React.useState("");                                // 결과


  // onChange functions

/**
 * 임신주수(주)
 * @param {*} e 
 */
  const onChangeCrntGestWeeksW = (e) => {  
    const value = trim(e.target.value);

    if(value !== ''){
      if(checkNumberRage(value, 0, 42)){
        if(crntGestWeeksD !== '') calculateEdc(value, crntGestWeeksD, date);
        setCrntGestWeeksW(value);
      }else focus('임신주수를 확인하세요.', getObject('crntGestWeeksW')); 
    }else {
      setEdc("0000-00-00");
      setCrntGestWeeksW(value);
    }

    onChangePrevBtnDiv(date, hospital, idCode, motherAge, value, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map);

  }

/**
 * 임신주수(일)
 * @param {} e 
 */
  const onChangeCrntGestWeeksD = (e) => {  
    const value = trim(e.target.value);

    if(value !== ''){
      if(checkNumberRage(value, 0, 6)){
        if(crntGestWeeksW !== '') calculateEdc(crntGestWeeksW, value, date);
        setCrntGestWeeksD(value);
      }else focus('임신주수를 확인하세요.', getObject('crntGestWeeksD')); 
    }else {
      setEdc("0000-00-00");
      setCrntGestWeeksD(value);
    }

    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, value, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map);


  }

/**
 * 
 * @param {*} weeks 임신주수(주)
 * @param {*} days 임신주수(일)
 * @param {*} date 예측모델 기준일(날짜)
 */
  const calculateEdc = (weeks, days, date) => {
    const nWeeks = Number(weeks);
    const nDays = Number(days);

    if(validationNum(nWeeks) && 0 <= nWeeks && nWeeks <= 42) {
      setCrntGestWeeksW(weeks);
    }else focus("임신 주수를 확인하세요.", getObject("crntGestWeeksW"));

    if(validationNum(nDays) && 0 <= nDays && nDays <= 6) {
      setCrntGestWeeksD(days);
    } else focus("임신 주수를 확인하세요.", getObject("crntGestWeeksD"));


    // 0~13주까지는 E0, 그 이후는 M1
    if(0 <= nWeeks && nWeeks <= 13) { 
      setIsE0(true); 
    }else{
      setIsE0(false); 
    }


    // EDC 계산하기
    if(date !== "") {
      if(validationNum(nDays)){
        if(0 <= nDays && nDays <= 6){
            const alldays = (nWeeks * 7) + nDays; // 임신주수를 '일'수로 환산
            const pregDay = datePlusMinus(date, -alldays, 'd'); // 임신예측일
            const edc = datePlusMinus(pregDay, 280, 'd') ; // edc
            setEdc(edc);
        }
      }
    }//if
  }



      
/**
 * 기본정보 - 날짜 
 */
  const onChangeDate = (e) => {
  const value = trim(e.target.value);
  setDate(value);

  if(crntGestWeeksW !== '' && crntGestWeeksD !== '')
    calculateEdc(crntGestWeeksW, crntGestWeeksD, value);

  // 기본 필수항목 체크하여 '예측하기'버튼 활성화.
  onChangePrevBtnDiv();
}

  


/**
 * 면역질환 버튼 클릭 이벤트 ( y or n or dk)
 * @param {*} e 
 */
  const onChangeImmune = (e) => {
      // 클릭한 버튼에 따라 on/off 스타일 변경
      onChangeButtonState('immune', e.target);
      
      // 클릭한 값에 따른 기간/질환명 input 활성/비활성화.
      const value = (e.target.value === 'DK' ? null:e.target.value);

      if(value === '1'){
        document.getElementById('immuneDur').disabled = false;
        document.getElementById('immuneDurName').disabled = false;
      }else if(value === '0' || value === null){
        setImmuneDur("0");
        setImmuneDurName("");

        document.getElementById('immuneDur').disabled = true;
        document.getElementById('immuneDurName').disabled = true;
      }else {}

      setImmune(value);
  }



  /**
   * 면역질환 (기간, 개월 수)
   * @param {*} e 
   */
  const onChangeImmuneDur = (e) =>{
    const value  = trim(e.target.value);
    
    if(value !== ''){
      if(checkNumberRage(value, 1, 12)) setImmuneDur(value);
      else {focus("면역질환 기간을 확인하세요", getObject("immuneDur"));}
    }else setImmuneDur(value);
  }



  /**
   * 면역질환 (질환명)
   * @param {*} e 
   */
  const onChangeImmuneDurName = (e) => {
    setImmuneDurName(trim(e.target.value));
  }







  /**
   * 기본정보 - 병원
   * @param {*} e 
   */
  const onChangeHospital = (e) => {
    setHospital(trim(e.target.value));

    onChangePrevBtnDiv();
  }


  /**
   * 기본정보 - 식별번호
   * @param {*} e 
   */
  const onChangeIdCode = async(e) => {
    const value = trim(e.target.value);
    if (validationAlNum(value)) setIdCode(value.toUpperCase());
    else focus("식별번호는 영문4자리 + 숫자4자리입니다.", getObject("idCode"));

    // id code의 8자리가 입력완료되면, 해당 코드의 가장 최근 데이터를 조회해 세팅.
    if(value.length === 8){
      const result = await axios({
        method: "get",
        url: GDM_SERVER + "/get/recent?id_code=" + value + "&hospital=" + hospital,
        responseType: "type",
      });
      
      const data = result.data[0];
      // console.log(data);

      if(data) {

        setIsE0(Number(data.crnt_gest_weeks_w) <= 13 ? true:false);

        // 기본항목
          setDate(data.date);
          setHospital(data.hospital);
          setIdCode(data.id_code);
          setMotherAge(data.mother_age);
          setCrntGestWeeksW(data.crnt_gest_weeks_w);
          setCrntGestWeeksD(data.crnt_gest_weeks_d);

          setEdc(data.edc);
          setGestCnt(data.gest_cnt);
          setBirthCnt(data.birth_cnt);
          setFtpn(data.ftpn);
          setPbmh(data.pbmh);
          setNaturalMcCnt(data.natural_mc_cnt);
          setArtificialMcCnt(data.artificial_mc_cnt);

          // 기본 하위항목
          setTwinKind(data.twin_kind);
          setMotherOriginalWeight(data.mother_original_weight);
          setMotherHeight(data.mother_height);
          setMotherOriginalBmi(data.mother_original_bmi);
          setSbp(data.sbp);
          setDbp(data.dbp);
          setHr(data.hr);
          setMap(data.map);
          setSmoking(data.smoking);
          setVpgDur(data.vpg_dur);

          // 경산모
          setSurvch(data.survch);
          setCsec(data.csec);
          setPrevPrevia(data.prev_previa);
          setPrevGestDm(data.prev_gest_dm);
          setPrevLga(data.prev_lga);

          // 과거력
          setPhxCycle(data.phx_cycle);
          setIgt(data.igt);
          setHylipidc(data.hylipidc);
          setEnoth(data.enoth);
          setEnothName(data.enoth_name);
          setAdmDigest(data.adm_digest);
          setAdmDigestName(data.adm_digest_name);
          setAdmBlood(data.adm_blood);
          setAdmBloodName(data.adm_blood_name);
          setImmune(data.immune);
          setImmuneDur(data.immune_dur);
          setImmuneDurName(data.immune_dur_name);
          setPhxSkin(data.phx_skin);
          setPhxSkinName(data.phx_skin_name);
          setMyomano(data.myomano);
          setPcos(data.pcos);
          setPhxOvarian(data.phx_ovarian);

          // 가족력 항목
          setFhxDm(data.fhx_dm);
          setFhxHtm(data.fhx_htm);

          // 혈액검사결과
          setHb(data.hb);
          setWbc(data.wbc);
          setHct(data.hct);
          setPlt(data.plt);

          // BC
          setGfr(data.gfr);
          setTc(data.tc);
          setHdl(data.hdl);
          setAst(data.ast);
          setAlt(data.alt);

          // 혈당검사 
          setFasting100(data.fasting_100);
          setOgtt50(data.ogtt_50);
          setGlucose(data.glucose);
          setHba1c(data.hba1c);

          // 태아스크리닝
          setHcg(data.hcg);
          setPappa(data.pappa);
          setResult(data.result);
          
      }// if

      // 기존 데이터를 가져와 뿌려줬을때는 '예측하기'버튼을 바로 노출.
      document.getElementById("prevBtnDiv").style.display = 'block';
    }// if

    

  }




  /**
   * 기본정보 - 산모 나이
   * @param {*} e 
   */
  const onChangeMotherAge = (e) => {
    const value = trim(e.target.value);
    if(value !== ''){
      if(checkNumberRage(value, 0, 60)) {
        setMotherAge(value);
      }
      else {focus("산모 나이를 확인하세요", getObject("motherAge"));}
    }else setMotherAge(value);
    
    onChangePrevBtnDiv(date, hospital, idCode, value, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map);
  }





  /**
   * 임신중의 아기의 수
   * @param {*} e 
   */
  const onChangeTwinKind = (e) => {
    const value  = trim(e.target.value);
    
    if(value !== ''){
      if(checkNumberRage(value, 1, 6)) setTwinKind(value);
      else {focus("임신중의 아기의 수를 확인하세요", getObject("twinKind"));}
    }else setTwinKind(value);
  }




  /**
   * 기본정보 - 임신 전 키
   * @param {*} e 
   */
  const onChangeMotherHeight = (e) => {
    const value = trim(e.target.value);
    if(value !== ''){ 
      if(checkNumberRage(value, 1, 200)) {
        setMotherHeight(value);


        // 키, 체중 모두 0~200사이 값이면 bmi를 계산.
        if(motherOriginalWeight !== '') setMotherOriginalBmi(getBmi(value, motherOriginalWeight));

      }else{
        focus("임신 전 키를 확인하세요.", getObject("motherHeight"));
        setMotherOriginalBmi("");
      }
      
    }else setMotherHeight(value);

    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, value, motherOriginalBmi, sbp, dbp, map);

  }





  /**
   * 기본정보 - 임신 전 체중
   * @param {*} e 
   */
  const onChangeMotherOriginalWeight = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      // 키, 체중 모두 0~200사이 값이면 bmi를 계산.
      if(checkNumberRage(value, 1, 200))  {
        setMotherOriginalWeight(value);


        if(motherHeight !== '') setMotherOriginalBmi(getBmi(motherHeight, value));
      }else {
        focus("임신 전 키를 확인하세요.", getObject("motherOriginalWeight"));
        setMotherOriginalBmi("");
      }
      
    }else setMotherOriginalWeight(value);
    
    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, value, motherHeight, motherOriginalBmi, sbp, dbp, map);

  }

  

  /**
   * 혈압 (최고혈압)
   * @param {*} e 
   */
  const onChangeSbp = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(checkNumberRage(value, 1, 999)) {
        setSbp(value);

        // 최저혈압 입력값 있을 경우, MAP 계산함.
        // MAP : 계산식 : (최고혈압 + 2*최저혈압) / 3
        // 결과값은 소수점 2째자리에서 반올림. 1자리만 노출함.
        if(dbp !== ''){
          const map = (Number(value) + 2*Number(dbp))/3;
          setMap(map.toFixed(1));
        }

      }else focus("혈압을 확인하세요", getObject("sbp"));
    }else  {
      setSbp(value);
      setMap("");
    }

    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, value, dbp, map);
    
  }





  /**
   * 혈압 (최저혈압)
   * @param {*} e 
   */
   const onChangeDbp = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(checkNumberRage(value, 1, 999)) {
        setDbp(value);

        // 최고혈압 입력값 있을 경우, MAP 계산함.
        // MAP : 계산식 : (최고혈압 + 2*최저혈압) / 3
        // 결과값은 소수점 2째자리에서 반올림. 1자리만 노출함.
        if(sbp !== ''){
          const map = (Number(sbp) + 2*Number(value))/3;
          setMap(map.toFixed(1));
        }

      }else focus("혈압을 확인하세요", getObject("dbp"));
    }else  {
      setDbp(value);
      setMap("");
    }

    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, value, map);
    

  }


  

  /**
   * 맥박
   * @param {*} e 
   */
  const onChangeHr = (e) => {
    const value = trim(e.target.value)

    if(value !== ''){
      if(checkNumberRage(value, 1, 999)) setHr(value);
      else focus("맥박을 확인하세요", getObject("hr"));
    }else  setHr(value);
  }


  /**
   * MAP : 계산식 : (최고혈압 + 2*최저혈압) / 3
   * 혈압 입력시 자동 계산됨.
   * @param {*} e 
   */
  // const onChangeMap = (e) => {
  //   const value = trim(e.target.value);
  //   if(validationNum(value)) setMap(value);

  //   onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, value);
    
  // }



  /**
   * 흡연여부 (Y, N, DK)
   * @param {*} e 
   */
  const onChangeSmoking = (e) => {
    onChangeButtonState('smoking', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    setSmoking(value);  // Y, N, null ('모름'일 경우 null값을 넣음.)
  }



  const onChangeVpgDur = (e) => {
    const value = Number(trim(e.target.value));
    if(validationNum(value)) setVpgDur(value);
  }





  /**
   * 출산 횟수가 2회 이상이면 경산모 항목 화면 노출. 반대면 비노출.
   * @param {*} ftpn 
   * @param {*} pbmh 
   */
   const onDisplayMultiparousDiv = (ftpn, pbmh) => {
    if(ftpn !== '' && pbmh !== ''){
      const nFtpn = Number(ftpn);
      const nPbmh = Number(pbmh);
    
      const pregCnt = nFtpn + nPbmh; // 출산횟수 = 만삭분만횟수 + 조산횟수 

      setBirthCnt(pregCnt); 
      if(1 < Number(pregCnt))document.getElementById('multiparousDiv').style.display = 'block';
      else  {
        // 경산모가 아닐경우, 경산모 항목들 초기화 
        setSurvch("");
        setCsec("");
        setPrevPrevia("");
        setPrevGestDm("");
        setPrevLga("");

        // 경산모 영역 비노출
        document.getElementById('multiparousDiv').style.display = 'none';
      }
    }
  }


  

  /**
   * 과거임신횟수
   * @param {*} e 
   */
  const onChangeGestCnt = (e) => {
    let value = trim(e.target.value);
    if(value !== ''){
      if(checkNumberRage(value, 0, 20)){
      
        // 총 임신횟수 validation
        if(value !== ''
            && ftpn !== ''
            && pbmh !== ''
            && naturalMcCnt !== ''
            && artificialMcCnt !== ''
          ) if(!calculatePreg(value, ftpn, pbmh, naturalMcCnt, artificialMcCnt, "gestCnt" )) value = "";

      }else {
        focus('과거임신횟수를 확인하세요.' , getObject('gestCnt'));
        value = "";
      }
    }else value = "";

    setGestCnt(value);
    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, value, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map);

    
  }




  /**
   * 만삭분만횟수
   * @param {*} e 
   */
  const onChangeFtpn = (e) => {
    let value = trim(e.target.value);
    if(value !== ''){
      if(checkNumberRage(value, 0, 20)){
    
        // 경산모 항목 노출여부
        if(value !== '') if(pbmh !== '') onDisplayMultiparousDiv(value, pbmh);
        
      
        // 총 임신횟수 validation
        if(gestCnt !== ''
            && value !== ''
            && pbmh !== ''
            && naturalMcCnt !== ''
            && artificialMcCnt !== ''
          ) if(!calculatePreg(gestCnt, value, pbmh, naturalMcCnt, artificialMcCnt, "ftpn"  )) value = "";

      }else {
        focus('만삭분만횟수값을 확인하세요.' , getObject('ftpn'));
        value = "";
      }
    }else value = "";

    setFtpn(value);
    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, value, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map);

  }








  /**
   * 조산횟수
   * @param {*} e 
   */
  const onChangePbmh = (e) => {
    let value = trim(e.target.value);
    if(value !== ''){
      if(checkNumberRage(value, 0, 20)){
    
        // 경산모 항목 노출여부
        if(value !== '') if(ftpn !== '') onDisplayMultiparousDiv(ftpn, value); 
      
        // 총 임신횟수 validation
        if(gestCnt !== ''
            && ftpn !== ''
            && value !== ''
            && naturalMcCnt !== ''
            && artificialMcCnt !== ''
          ) if(!calculatePreg(gestCnt, ftpn, value, naturalMcCnt, artificialMcCnt, "pbmh"  )) value = "";

      }else {
        focus('조산횟수값을 확인하세요.' , getObject('pbmh'));
        value = "";
      }
    }else value = "";

    setPbmh(value);
    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, value, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map);

  }





  /**
   * 유산횟수 (자연)
   * @param {*} e 
   */
  const onChangeNaturalMcCnt = (e) => {
    let value = trim(e.target.value);
    if(value !== ''){
      if(checkNumberRage(value, 0, 20)){
      
        // 총 임신횟수 validation
        if(gestCnt !== ''
            && ftpn !== ''
            && pbmh !== ''
            && value !== ''
            && artificialMcCnt !== ''
          ) if(!calculatePreg(gestCnt, ftpn, pbmh, value, artificialMcCnt, "naturalMcCnt" )) value = "";

      }else {
        focus('유산횟수값을 확인하세요.' , getObject('naturalMcCnt'));
        value = "";
      }
    }else value = "";

    setNaturalMcCnt(value);
    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, value, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map);

  }





  /**
   * 유산횟수 (인공)
   * @param {*} e 
   */
  const onChangeArtificialMcCnt = (e) => {

    let value = trim(e.target.value);
    if(value !== ''){
      if(checkNumberRage(value, 0, 20)){
      
        // 총 임신횟수 validation
        if(gestCnt !== ''
            && ftpn !== ''
            && pbmh !== ''
            && value !== ''
            && artificialMcCnt !== ''
          ) if(!calculatePreg(gestCnt, ftpn, pbmh, naturalMcCnt, value, "artificialMcCnt")) value = "";

      }else {
        focus('유산횟수값을 확인하세요.' , getObject('artificialMcCnt'));
        value = "";
      }
    }else value = "";

    setArtificialMcCnt(value);
    onChangePrevBtnDiv(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, value, value, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map);

  }





  /**
   * 과거임신횟수 >= 만삭불만횟수 + 조산횟수 + 유산횟수(자연+인공) 이어야 함.
   * @param {*} gestCnt : 과거임신횟수
   * @param {*} ftpn : 만삭분만횟수
   * @param {*} pbmh : 조산횟수
   * @param {*} naturalMcCnt : 유산(자연)
   * @param {*} artificialMcCnt : 유산(인공)
   * @param {*} objectId : 
   */
  const calculatePreg = (gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, objectId) => {
    const nGestCnt = Number(gestCnt);
    const nFtpn = Number(ftpn);
    const nPbmh = Number(pbmh);
    const nNaturalMcCnt = Number(naturalMcCnt);
    const nArtificialMcCnt = Number(artificialMcCnt);

    const totalGestCnt = nFtpn + nPbmh + nNaturalMcCnt + nArtificialMcCnt;
    if(nGestCnt < totalGestCnt) {
      focus("만삭분만횟수, 조산횟수, 유산횟수의 합이 과거임신횟수보다 많을 수 없습니다.", getObject(objectId));
      return false;
    }else return true;
  }





  /**
   * 생존아 수 
   * @param {*} e 
   */
  const onChangeSurvch = (e) => {
    const value  = trim(e.target.value);
    
    if(value !== ''){
      const nValue = Number(value);
      if(checkNumberRage(nValue, 0, 20)) setSurvch(nValue);
      else {focus("생존아수를 확인하세요", getObject("survch"));}
    }else setSurvch(value);
  }





  /**
   * 제왕절개 수술 횟수
   * @param {*} e 
   */
  const onChangeCsec = (e) => {
    const value  = trim(e.target.value);
    
    if(value !== ''){
      const nValue = Number(value);
      if(checkNumberRage(nValue, 0, 20)) setCsec(nValue);
      else {focus("제왕절개 수술 횟수를 확인하세요", getObject("csec"));}
    }else setCsec(value);
  }





  /**
   * 과거 임신시 전치태반
   * @param {*} e 
   */
  const onChangePrevPrevia = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('prevPrevia', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    setPrevPrevia(value); // Y, N, null ('모름'일 경우 null값을 넣음.)
  }






  /**
   * 과거 임신시 임신성 당뇨
   * @param {*} e 
   */
  const onChangePrevGest = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('prevGestDm', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    setPrevGestDm(value); // Y, N, null ('모름'일 경우 null값을 넣음.)
  }





  /**
   * 거대아 분만력
   * @param {*} e 
   */
  const onChangePrevLga = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('prevLga', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    setPrevLga(value);
  }




  /**
   * 고혈압
   * @param {*} e 
   */
    const onChangePhxCycle = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('phxCycle', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    setPhxCycle(value);
  }





  /**
   * 인슐린저항성관련질환
   * @param {*} e 
   */
    const onChangeIgt = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('igt', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    setIgt(value);
  }





  /**
   * 고지혈증
   * @param {*} e 
   */
   const onChangeHylipidc = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('hylipidc', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    setHylipidc(value);
  }





  /**
   * 기타 내분비질환
   * @param {*} e 
   */
   const onChangeEnoth = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('enoth', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    

    if(value === '1'){
      document.getElementById('enothName').disabled = false;
    }else if(value === '0' || value === null){
      setEnothName("");
      document.getElementById('enothName').disabled = true;
    }else{}

    setEnoth(value);
  }



  /**
   * 면역질환명
   * @param {*} e 
   */
  const onChangeEnothName = (e) => {
    setEnothName(trim(e.target.value));
  }





  /**
   * 과거력 혹은 임신중 - 소화기계질환
   * @param {*} e 
   */
   const onChangeAdmDigest = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('admDigest', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    

    if(value === '1'){
      document.getElementById('admDigestName').disabled = false;
    }else if(value === '0' || value === null){
      setAdmDigestName("");
      document.getElementById('admDigestName').disabled = true;
    }else{}

    setAdmDigest(value);
  }



  /**
   * 과거력 혹은 임신중 - 소화기계질환명 
   * @param {*} e 
   */
  const onChangeAdmDigestName = (e) => {
    setAdmDigestName(trim(e.target.value));
  }



  /**
   * 혈액질환
   * @param {*} e 
   */
   const onChangeAdmBlood = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('admBlood', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    
    if(value === '1'){
      document.getElementById('admBloodName').disabled = false;
    }else if(value === '0' || value === null){
      setAdmBloodName("");
      document.getElementById('admBloodName').disabled = true;
    }else{}

    setAdmBlood(value);
  }




  /**
   * 혈액질환 질환명 
   * @param {*} e 
   */
   const onChangeAdmBloodName = (e) => {
    setAdmBloodName(trim(e.target.value));
  }




  /**
   * 피부질환
   * @param {*} e 
   */
   const onChangePhxSkin = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('phxSkin', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    
    if(value === '1'){
      document.getElementById('phxSkinName').disabled = false;
    }else if(value === '0' || value === null){
      setPhxSkinName("");
      document.getElementById('phxSkinName').disabled = true;
    }else{}

    setPhxSkin(value);
  }





  /**
   * 피부질환 질환명 
   * @param {*} e 
   */
   const onChangePhxSkinName = (e) => {
    setPhxSkinName(trim(e.target.value));
  }




  /**
   * 자궁근종개수 : 임신횟수이하
   * @param {*} e 
   */
   const onChangeMyomano = (e) => {
    const value  = trim(e.target.value);
    
    if(value !== ''){
      if(gestCnt === ''){
        focus("임신횟수를 먼저 입력하세요.", getObject("gestCnt"));
      }else{
        // 자궁근종개수는 임신횟수 이상값을 가질 수 없음.
        if(checkNumberRage(value, 0, gestCnt)) setMyomano(value);
        else {focus("자궁근종개수를 확인하세요", getObject("myomano"));}
      }
      
    }else setMyomano(value);
  }






   /**
   * 다낭성 난소
   * @param {*} e 
   */
     const onChangePcos = (e) => {
      // 클릭한 버튼에 따라 on/off 스타일 변경
      onChangeButtonState('pcos', e.target);
  
      const value = (e.target.value === 'DK' ? null:e.target.value);
      setAdmBlood(value);
    }





  /**
   * 난소 혹
   * @param {*} e 
   */
     const onChangePhxOvarian = (e) => {
      // 클릭한 버튼에 따라 on/off 스타일 변경
      onChangeButtonState('phxOvarian', e.target);
  
      const value = (e.target.value === 'DK' ? null:e.target.value);
      setPhxOvarian(value);
    }





  /**
   * 당뇨
   * @param {*} e 
   */
  const onChangeFhxDm = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('fhxDm', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    setFhxDm(value);
  }





  /**
   * 당뇨
   * @param {*} e 
   */
   const onChangeFhxHtm = (e) => {
    // 클릭한 버튼에 따라 on/off 스타일 변경
    onChangeButtonState('fhxHtm', e.target);

    const value = (e.target.value === 'DK' ? null:e.target.value);
    setFhxHtm(value);
  }




  /**
   * HB : 범위 0.1 ~ 25.0. 소수점 1자리.
   * @param {*} e 
   */
   const onChangeHb = (e) => {
    const value  = trim(e.target.value);
    
    if(value !== ''){
      if(checkNumberRage(value, 0.1, 25.0)) {
        setHb(checkNumberPoint(value, 1));
      }else focus("HB를 확인하세요", getObject("hb"));
    }else setHb(value);
  }




  /**
   * WBC : 범위 0.01 ~50.00. 소수점 2자리.
   * @param {*} e 
   */
   const onChangeWbc = (e) => {
    const value  = trim(e.target.value);
    
    if(value !== ''){
      if(checkNumberRage(value, 0.01, 50.00)) {
        setWbc(checkNumberPoint(value, 2));
      }else focus("WBC를 확인하세요", getObject("wbc"));
    }else setWbc(value);
  }




  /**
   * HCT : 범위 20.0 ~ 80.0. 소수점 1자리.
   * @param {*} e 
   */
   const onChangeHct = (e) => {
    const value  = trim(e.target.value);
    setHct(value);
    
    // if(value !== ''){
    //   if(checkNumberRage(value, 20.0, 80.0)) {
    //     setHct(checkNumberPoint(value, 1));
    //   }else focus("HCT를 확인하세요", getObject("hct"));
    // }else setHct(value);
  }




  /**
   * PLT : 범위 2.0 ~ 1000. 소수점 1자리.
   * @param {*} e 
   */
   const onChangePlt = (e) => {
    const value  = trim(e.target.value);
    setPlt(value);
    // if(value !== ''){
    //   if(checkNumberRage(value, 2.0, 1000)) {
    //     setPlt(checkNumberPoint(value, 1));
    //   }else focus("PLT를 확인하세요", getObject("plt"));
    // }else setPlt(value);
  }




  /**
   * GFR : 범위 0 ~ 1000 정수.
   * @param {*} e 
   */
   const onChangeGfr = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(validationNum(value)){
        if(checkNumberRage(value, 0, 1000)) setGfr(value);
        else {focus("GFR을 확인하세요", getObject("gfr"));}
      }else{
        setGfr(getOnlyNumber(value));
      }
      
    }else setGfr(getOnlyNumber(value));

  }





  /**
   * TC : 범위 0 ~ 1000 정수.
   * @param {*} e 
   */
   const onChangeTc = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(validationNum(value)){
        if(checkNumberRage(value, 0, 1000)) setTc(value);
        else {focus("Total cholesterol을 확인하세요", getObject("tc"));}
      }else{
        setTc(getOnlyNumber(value));
      }
      
    }else setTc(getOnlyNumber(value));
  }




  /**
   * HDL : 범위 0 ~ 1000 정수.
   * @param {*} e 
   */
   const onChangeHdl = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(validationNum(value)){
        if(checkNumberRage(value, 0, 1000)) setHdl(value);
        else {focus("Cholesterol을 확인하세요", getObject("hdl"));}
      }else{
        setHdl(getOnlyNumber(value));
      }
      
    }else setHdl(getOnlyNumber(value));
  }




  /**
   * AST : 범위 0 ~ 1000 정수.
   * @param {*} e 
   */
   const onChangeAst = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(validationNum(value)){
        if(checkNumberRage(value, 0, 1000)) setAst(value);
        else {focus("AST를 확인하세요", getObject("ast"));}
      }else{
        setAst(getOnlyNumber(value));
      }
      
    }else setAst(getOnlyNumber(value));
  }



  /**
   * ALT : 범위 0 ~ 1000 정수.
   * @param {*} e 
   */
   const onChangeAlt = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(validationNum(value)){
        if(checkNumberRage(value, 0, 1000)) setAlt(value);
        else {focus("ALT를 확인하세요", getObject("alt"));}
      }else{
        setAlt(getOnlyNumber(value));
      }
      
    }else setAlt(getOnlyNumber(value));
  }




  /**
   * FBS : 범위 0 ~ 1000 정수.
   * @param {*} e 
   */
   const onChangeFasting100 = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(validationNum(value)){
        if(checkNumberRage(value, 0, 1000)) setFasting100(value);
        else {focus("FBS를 확인하세요", getObject("fasting100"));}
      }else{
        setFasting100(getOnlyNumber(value));
      }
      
    }else setFasting100(getOnlyNumber(value));
  }




  /**
   * 50g GTT : 범위 0 ~ 1000 정수.
   * @param {*} e 
   */
   const onChangeOgtt50 = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(validationNum(value)){
        if(checkNumberRage(value, 0, 1000)) setOgtt50(value);
        else {focus("50g GTT를 확인하세요", getObject("ogtt50"));}
      }else{
        setOgtt50(getOnlyNumber(value));
      }
      
    }else setOgtt50(getOnlyNumber(value));
  }




  /**
   * Randome glucose : 범위 0 ~ 1000 정수.
   * @param {*} e 
   */
   const onChangeGlucose = (e) => {
    const value = trim(e.target.value);

    if(value !== ''){
      if(validationNum(value)){
        if(checkNumberRage(value, 0, 1000)) setGlucose(value);
        else {focus("Randome glucose를 확인하세요", getObject("glucose"));}
      }else{
        setGlucose(getOnlyNumber(value));
      }
      
    }else setGlucose(getOnlyNumber(value));
  }




  /**
   * HbA1C : 범위 1 ~20 소수점 1자리.
   * @param {*} e 
   */
   const onChangeHba1c = (e) => {
    const value  = trim(e.target.value);
    
    if(value !== ''){
      if(checkNumberRage(value, 1, 20)) {
        setHba1c(checkNumberPoint(value, 1));
      }else focus("HbA1C를 확인하세요", getObject("hba1c"));
    }else setHba1c(value);
  }





  /**
   * hCG : 범위 0 ~100 소수점 3자리.
   * @param {*} e 
   */
   const onChangeHcg = (e) => {
    const value  = trim(e.target.value);
    
    if(value !== ''){
      if(checkNumberRage(value, 0, 100)) {
        setHcg(checkNumberPoint(value, 3));
      }else focus("hCG를 확인하세요", getObject("hcg"));
    }else setHcg(value);
  }




  /**
   * PAPP-A : 범위 0 ~100 소수점 3자리.
   * @param {*} e 
   */
   const onChangePappa = (e) => {
    const value  = trim(e.target.value);
    
    if(value !== ''){
      if(checkNumberRage(value, 0, 100)) {
        setPappa(checkNumberPoint(value, 3));
      }else focus("PAPP-A를 확인하세요", getObject("pappa"));
    }else setPappa(value);
  }

  /**
   * 기본항목 상단의 필수입력항목 체크
   * 기본 필수항목 상단의항목을 모두 기입해야, 하단의 예측하기 버튼이 활성화 됨.
   * @returns true or false
   */
  const checkBasicData = (date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map   ) => {
      // 항목 입력 여부 확인
      if(date === ""
        || hospital === ""
        || idCode === ""
        || motherAge === ""
        || crntGestWeeksW === ""
        || crntGestWeeksD === ""
        || edc === ""
        || gestCnt === ""
        || ftpn === ""
        || pbmh === ""
        || naturalMcCnt === ""
        || artificialMcCnt === ""
        // || motherOriginalWeight === ""
        // || motherHeight === ""
        // || motherOriginalBmi === ""
        // || sbp === ""
        // || dbp === ""
        // || map === ""
      ) {
        return false;
      }else return true;

  }

/**
 * 기본항목 중 필수입력항목을 체크하여 하단의 '예측하기'버튼을 활성화/비활성화 함.
 * @param {*} date 
 * @param {*} hospital 
 * @param {*} idCode 
 * @param {*} motherAge 
 * @param {*} crntGestWeeksW 
 * @param {*} crntGestWeeksD 
 * @param {*} edc 
 * @param {*} gestCnt 
 * @param {*} ftpn 
 * @param {*} pbmh 
 * @param {*} naturalMcCnt 
 * @param {*} artificialMcCnt 
 * @param {*} motherOriginalWeight 
 * @param {*} motherHeight 
 * @param {*} motherOriginalBmi 
 * @param {*} sbp 
 * @param {*} dbp 
 * @param {*} map 
 */
  const onChangePrevBtnDiv = (date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map) => {
    if(checkBasicData(date, hospital, idCode, motherAge, crntGestWeeksW, crntGestWeeksD, edc, gestCnt, ftpn, pbmh, naturalMcCnt, artificialMcCnt, motherOriginalWeight, motherHeight, motherOriginalBmi, sbp, dbp, map)) document.getElementById("prevBtnDiv").style.display = 'block';
    else document.getElementById("prevBtnDiv").style.display = 'none';
  }


  /**
   * 경산모 필수항목 체크
   * 필수입력항목 : 과거 임신시 임신성 당뇨, 거대아 분만력
   * @returns 
   */
  const checkMultiparousData = async() => {
    if(prevGestDm === "" || prevLga === "") {
        return false;
    }else return true;
  }


  /**
   * 기본정보 및 경산모 항목을 제외한 나머지 필수입력항목 체크
   * E0 or M1에 따라 항목에 차이가 있음.
   * @param {*} value : 
   */
  const checkData = async(value) => {

    console.log('isE0 : ' + value);
    if(value === 'E0'){

      if(hylipidc === ""
          || enoth === ""
          || fhxDm === ""
        ) return false;

    }else if(value === 'M1'){
      console.log('hylipidc : ' + hylipidc);
      console.log('enoth : ' + enoth);
      console.log('fhxDm : ' + fhxDm);
      console.log('immune : ' + immune);
      console.log('phxSkin : ' + phxSkin);
      console.log('myomano : ' + myomano);
      console.log('wbc : ' + wbc);
      console.log('gfr : ' + gfr);
      console.log('hdl : ' + hdl);
      console.log('fasting100 : ' + fasting100);
      console.log('ogtt50 : ' + ogtt50);
      console.log('hba1c : ' + hba1c);
      console.log('hcg : ' + hcg);
      console.log('immuneDur : ' + immuneDur);

        if(hylipidc === ""
        || enoth === ""
        || fhxDm === ""
        || immune === ""
        || phxSkin === ""
        || myomano === ""
        || wbc === ""
        || gfr === ""
        || hdl === ""
        || fasting100 === ""
        || ogtt50 === ""
        || hba1c === ""
        || hcg === ""
      )  return false;


      // 면역질환 yes일때 기간 누락할 경우,
      if(immune === "0") if(immuneDur === "") return false;


    }//else


  }


  /**
   * 이너웨이브 연동 
   */
  const getResult = async() => {

        // 저장하기
        const data = {
          date : date,
          instcd: hospital,
          rid: idCode,
          age: motherAge,
          gaw : crntGestWeeksW, // api연동시에는 임신주수(주)만 보냄.
          twinKind: twinKind,
          wt: motherOriginalWeight,
          ht: motherHeight,
          bmi: motherOriginalBmi,
          g: gestCnt,
          a: Number(naturalMcCnt) + Number(artificialMcCnt),
          p: Number(ftpn) + Number(pbmh),
          sbp: sbp,
          dbp: dbp,
          hr: hr,
          map: map,
          smoking: smoking,
          fhxDm: fhxDm,
          fhxHtn: fhxHtm,
          phxCycle: phxCycle,
          pcos: pcos,
          igt: igt,
          hyperlipidemia: hylipidc,
          enoth: enoth,
          admBlood: admBlood,
          admDigest: admDigest,
          phxOvarian: phxOvarian,
          phxSkin: phxSkin,
          immuneDur: immuneDur,
          myomano: myomano,
          survch: survch,
          prevGestDm: prevGestDm,
          csec: csec,
          pbmh: pbmh,
          prevPrevia: prevPrevia,
          prevLga: prevLga,
          ftpn: ftpn,
          wbc: wbc,
          hb: hb,
          hct: hct,
          plt: plt,
          tc: tc,
          hdl: hdl,
          alt: alt,
          ast: ast,
          _100gF: fasting100,
          glu: glucose,
          hba1c: hba1c,
          pappa: pappa,
          hcg: hcg,
          _50g: ogtt50,
          gfr: gfr,
          vpgDur:vpgDur
        }// apiData

        console.log(data);

        let result = null;
        const headers = {
          "Content-type": "application/json",
         // authKey: "6c65b545-175a-461b-baff-ca97118b102a",
        };
        await axios
          .post(INNERWARE_SERVER, data, { headers })
          .then(function (response) {
            console.log(response);
            result = response.data.success;
          })
          .catch(function (error) {
            console.log(error);
            alert(
              error + " : GDM API연동 오류입니다. 확인 후 다시 저장하세요."
            );
            // window.location.replace("/prediction");
            return;
          });     
  
  }

  // db에 데이터 저장하기
  const saveData = async() => {
      const data = {
          date : date,
          hospital: hospital ,
          id_code: idCode,
          mother_age: motherAge,
          crnt_gest_weeks_w: crntGestWeeksW,
          crnt_gest_weeks_d: crntGestWeeksD,
          edc: edc,
          gest_cnt: gestCnt,
          birth_cnt: Number(ftpn) + Number(pbmh),
          ftpn: ftpn,
          pbmh: pbmh,
          mc_cnt: Number(naturalMcCnt) + Number(artificialMcCnt),
          natural_mc_cnt: naturalMcCnt,
          artificial_mc_cnt: artificialMcCnt,
          twin_kind: twinKind,
          mother_original_weight: motherOriginalWeight,
          mother_height: motherHeight,
          mother_original_bmi: motherOriginalBmi,
          sbp: sbp,
          dbp: dbp,
          hr: hr,
          map: map,
          smoking: smoking,
          vpg_dur: vpgDur,
          survch: survch,
          csec: csec,
          prev_previa: prevPrevia,
          prev_gest_dm: prevGestDm,
          prev_lga: prevLga,
          phx_cycle: phxCycle,
          igt: igt,
          hylipidc: hylipidc,
          enoth: enoth,
          enoth_name: enothName,
          adm_digest: admDigest,
          adm_digest_name: admDigestName,
          adm_blood: admBlood,
          adm_blood_name:admBloodName ,
          immune: immune,
          immune_dur: immuneDur,
          immune_dur_name: immuneDurName,
          phx_skin: phxSkin,
          phx_skin_name: phxSkinName,
          myomano: myomano,
          pcos: pcos,
          phx_ovarian: phxOvarian,
          fhx_dm: fhxDm,
          fhx_htm: fhxHtm,
          hb: hb,
          wbc: wbc,
          hct: hct,
          plt: plt,
          gfr: gfr,
          tc: tc,
          hdl: hdl,
          ast: ast,
          alt: alt,
          fasting_100: fasting100,
          ogtt_50: ogtt50,
          glucose: glucose,
          hba1c: hba1c,
          hcg: hcg,
          pappa: pappa,
          result: result,
          delete_yn: 0
      };

      console.log(data);

      await axios
        .post(GDM_SERVER + "/add", data)
        .then(function (response) {
          console.log(response);
          if (response.data === true && response.status === 200) {
            alert("저장되었습니다.");
            window.location.replace("/search?hospital=" + hospital + "&idCode=" + idCode);
          }
        })
        .catch(function (error) {
          console.log(error);
          alert(error + " : 저장하지 못하였습니다.");
          return;
        });

  }


  // 예측 후 저장
  // 서버 올린 뒤 api연동 결과값 확인하기. 현재는 임시값으로 테스트.
  const addData = async() => {
    let checkVal = true;

    // 기본 필수 항목 체크
    if(!checkBasicData()) {
      alert("기본정보 필수 입력항목을 확인하세요.");
    }else{

        // * 예측하기
        // 경산모 필수 항목 체크 : 출산횟수가 2회 이상이면서 경산모 필수입력항목 기재가 누락된 경우.
        if(birthCnt > 1) if(!checkMultiparousData()) checkVal = false;
        else if(!checkData( isE0 ===  true ? 'E0' : 'M1')) checkVal = false;
        else if(
              motherOriginalWeight === ""
              || motherHeight === ""
              || motherOriginalBmi === ""
              || sbp === ""
              || dbp === ""
              || map === ""
          ) checkVal = false;
          else{}

        if(!checkVal) {

          // eslint-disable-next-line no-restricted-globals
          if(confirm('예측모델 필수값이 빠져있습니다. 이대로 진행하실 경우 예측 결과의 신뢰도가 떨어집니다. 진행하시겠습니까?') ) setResult(getResult()); 
          else return;

        }else setResult(getResult());
       
        // * 저장하기
        saveData();

   
    }// ELSE
  }// CONST


  return (
    
    <div className="content-container">
      <div className="prediction-description">예측 필요항목<span style={{fontSize: 9, color: '#f55d42', marginBottom: 25,  marginLeft: 6 }} >●</span><font style={{marginLeft: 50, fontWeight:'lighter'}}>선택항목</font></div> 
      <div className="prediction-main">
        <div className="prediction-main-item ">
          <div className="left_empty" />
          <div className="left_title"> <h1>기본정보</h1>&nbsp;&nbsp;<font style={{ fontSize:15, paddingTop:15, color:'#f55d42', fontWeight:'bolder' }} >* 입력필수</font></div>
        </div>
        <hr className="prediction-main_title_border_style" />

        
 

        <div className="prediction-main-item">
          <div className="left-bold">날짜 <span className="left-red-point" >●</span></div>
          <div className="right">
            <input type="date" id="date" value={date} onChange={onChangeDate}  required pattern="\d{4}-\d{2}-\d{2}" /> <font className="left-red-description">예측모델 기준 날짜</font>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left-bold">병원<span className="left-red-point" >●</span></div>
          <div className="right">
              <select id="hospital" onChange={onChangeHospital}> 
               <option key="" value="">
                병원선택
              </option>
              <option key="01" value="서울성모병원">
                서울성모병원
              </option>
              <option key="02" value="여의도 성모병원">
                여의도 성모병원
              </option>
              <option key="03" value="의정부 성모병원">
                의정부 성모병원
              </option>
              <option key="04" value="부천 성모병원">
                부천 성모병원
              </option>
              <option key="05" value="인천 성모병원">
                인천 성모병원
              </option>
              <option key="06" value="대전 성모병원">
                대전 성모병원
              </option>
              <option key="07" value="성빈센트 성모병원">
                성빈센트 성모병원
              </option>
              <option key="08" value="은평 성모병원">
                은평 성모병원
              </option>
            </select> 
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left-bold">식별 번호<span className="left-red-point" >●</span></div>
          <div className="right">
            <input
              id="idCode"
              value={idCode}
              onChange={onChangeIdCode}
              placeholder="RRRR0000"
              maxLength="8"
            />
            <font className="left-red-description">고유 구분번호 (영문4자 + 숫자4자)</font>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left-bold">산모 나이<span className="left-red-point" >●</span></div>
          <div className="right">
            <input
              id="motherAge"
              name="motherAge"
              value={motherAge}
              onChange={onChangeMotherAge}
              maxLength="2"
              placeholder="0"
              type="number"
            />
            <span>세</span>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left-bold">임신주수<span className="left-red-point" >●</span></div>
          <div className="right">
            <input
              id="crntGestWeeksW"
              value={crntGestWeeksW}
              onChange={onChangeCrntGestWeeksW}
              placeholder="0~42"
              maxLength="2"
              type="number"
              style={{ width: "100px" }}
            />
            <span>주</span>
            <input
              id="crntGestWeeksD"
              value={crntGestWeeksD}
              onChange={onChangeCrntGestWeeksD}
              placeholder="0~6"
              maxLength="1"
              type="number"
              style={{ width: "100px" }}
            />
            <span>일 (EDC : {edc})</span> 
          </div>
        </div><hr className="prediction-main_sub_border_style" />




        <div className="prediction-main-item">
          <div className="left-bold">과거임신횟수<span className="left-red-point" >●</span></div>
          <div className="right">
            <input
              id="gestCnt"
              value={gestCnt}
              onChange={onChangeGestCnt}
              maxLength="2"
              placeholder="0"
              type="number"
            />
            <span>회</span>
            <font className="left-red-description">없을경우 ‘0’으로 입력해주세요</font>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left-bold">만삭분만횟수<span className="left-red-point" >●</span></div>
          <div className="right">
            <input
              id="ftpn"
              value={ftpn}
              onChange={onChangeFtpn}
              maxLength="2"
              placeholder="0"
              type="number"
            />
            <span>회</span>
            <font className="left-red-description">없을경우 ‘0’으로 입력해주세요</font>
          </div>
        </div><hr className="prediction-main_sub_border_style" />




        <div className="prediction-main-item">
          <div className="left-bold">조산횟수<span className="left-red-point" >●</span></div>
          <div className="right">
            <input
              id="pbmh"
              value={pbmh}
              onChange={onChangePbmh}
              maxLength="2"
              placeholder="0"
              type="number"
            />
            <span>회</span>
            <font className="left-red-description">없을경우 ‘0’으로 입력해주세요</font>
          </div>
        </div><hr className="prediction-main_sub_border_style" />




        <div className="prediction-main-item">
          <div className="left-bold">유산횟수<span className="left-red-point" >●</span></div>
          <div className="right">
            자연&nbsp;
            <input
              id="naturalMcCnt"
              value={naturalMcCnt}
              onChange={onChangeNaturalMcCnt}
              maxLength="2"
              placeholder="0"
              type="number"
              style={{ width: "100px" }}
            />
            <span>회</span>
            &nbsp;&nbsp;&nbsp;&nbsp;
            인공&nbsp;
            <input
              id="artificialMcCnt"
              value={artificialMcCnt}
              onChange={onChangeArtificialMcCnt}
              maxLength="2"
              placeholder="0"
              type="number"
              style={{ width: "100px" }}
            />
            <span>회</span>
            <font className="left-red-description">없을경우 ‘0’으로 입력해주세요</font>
          </div>
        </div><hr className="prediction-main_sub_border_style" />




{/** 하위 항목들 */}
<br /><br /><br /><br /><br /><br /><br /><br /><br />
<hr className="prediction-main_sub_border_style" />

        <div className="prediction-main-item">
          <div className="left">임신중인 아기의 수</div>
          <div className="right">
            <input
              id="twinKind"
              value={twinKind}
              onChange={onChangeTwinKind}
              maxLength="2"
              placeholder="0"
              type="number"
            />
            <span>명</span>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left-bold">임신 전 키, 체중(BMI)<span className="left-red-point" >●</span></div>
          <div className="right">
            <input
              id="motherHeight"
              value={motherHeight}
              onChange={onChangeMotherHeight}
              maxLength="3"
              placeholder="0"
              type="number"
              style={{ width: "100px" }}
            />
            <span>cm, </span>
            &nbsp;&nbsp;
            <input
              id="motherOriginalWeight"
              value={motherOriginalWeight}
              onChange={onChangeMotherOriginalWeight}
              maxLength="3"
              placeholder="0"
              type="number"
              style={{ width: "100px" }}
            />
            <span>kg </span>
            &nbsp;&nbsp;
            (&nbsp;<input
              id="motherOriginalBmi"
              value={motherOriginalBmi}
              maxLength="2"
              placeholder="0"
              type="number"
              style={{ width: "100px" }}
              disabled
            />&nbsp;)
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left-bold">혈압<span className="left-red-point" >●</span></div>
          <div className="right">
            <input
              id="sbp"
              value={sbp}
              onChange={onChangeSbp}
              maxLength="3"
              placeholder="0"
              type="number"
              style={{ width: "100px" }}
            />&nbsp;&nbsp; / &nbsp;&nbsp;
            <input
              id="dbp"
              value={dbp}
              onChange={onChangeDbp}
              maxLength="3"
              placeholder="0"
              type="number"
              style={{ width: "100px" }}
            />
            <span>mmHg </span> 
            <font className="left-red-description">가장 최근에 측정한 혈압을 입력해주세요</font>
          </div>
        </div><hr className="prediction-main_sub_border_style" />




        <div className="prediction-main-item">
          <div className="left">맥박</div>
          <div className="right">
            <input
              id="hr"
              value={hr}
              onChange={onChangeHr}
              maxLength="3"
              placeholder="0"
              type="number"
            />
            <span>회</span>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left-bold">MAP<span className="left-red-point" >●</span></div>
          <div className="right">
            <input
              id="map"
              value={map}
              // onChange={onChangeMap}
              maxLength="2"
              placeholder="0"
              disabled
            />
            <span>mmHg</span>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">흡연여부</div>
          <div className="right">
            <button
                value="1"
                id="smokingN"
                onClick={onChangeSmoking}
                style={{ marginRight: "30px" }}
                className={
                  smoking === "1" 
                  ? "active" : ""
                }
                > Yes
              </button>
              <button 
                value="0" 
                id="smokingY" 
                onClick={onChangeSmoking}
                style={{ marginRight: "30px" }}
                className={
                  smoking === "0" 
                  ? "active" : ""
                }
              > No
              </button>
              <button 
                value="DK" 
                id="smokingDK" 
                onClick={onChangeSmoking}
                className={
                  smoking === null
                  ? "active" : ""
                }
              > 모름
              </button>
          </div>
        </div><hr className="prediction-main_sub_border_style" />

        <div className="prediction-main-item">
          <div className="left">프로게스테론 사용기간</div>
          <div className="right">
            <input
              id="vpgDur"
              value={vpgDur}
              onChange={onChangeVpgDur}
              maxLength="2"
              placeholder="0"
              type="number"
            />
            <span>주</span>
            <font className="left-red-description">사용하지 않았을 경우 0으로 표기해주세요</font>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
{/* --------------------------------------------------------------------------------------------------- */}
{/* --------------------------------------  경   산   모  ----------------------------------------------- */}
{/* --------------------------------------------------------------------------------------------------- */}
<div id='multiparousDiv' >
        <div className="prediction-main-item">
        <div className="left_empty" />
          <div className="left_title"> <h1>경산모</h1>&nbsp;<font style={{ fontSize:15, paddingTop:15, color:'#f55d42', fontWeight:'bolder' }} >* 만삭분만횟수+조산횟수가 1회 이상인 경우에 입력 할 수 있습니다.</font></div>
        </div>
        <hr className="prediction-main_title_border_style" />


        <div className="prediction-main-item">
          <div className="left">생존아수</div>
          <div className="right">
            <input
              id="survch"
              value={survch}
              onChange={onChangeSurvch}
              maxLength="2"
              placeholder="0"
              type="number"
            />
            <span>회</span>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">제왕절개 수술 횟수</div>
          <div className="right">
            <input
              id="csec"
              value={csec}
              onChange={onChangeCsec}
              maxLength="2"
              placeholder="0"
              type="number"
            />
            <span>회</span>
          </div>
        </div><hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">과거 임신시 전치태반</div>
          <div className="right">
            <button
                value="1"
                id="prevPreviaY"
                style={{ marginRight: "30px" }}
                onClick={onChangePrevPrevia}
                className={
                  prevPrevia === "1" 
                  ? "active" : ""
                }
                > Yes
              </button>
              <button 
                value="0" 
                id="prevPreviaN" 
                onClick={onChangePrevPrevia}
                style={{ marginRight: "30px" }}
                className={
                  prevPrevia === "0" 
                  ? "active" : ""
                }
              > No
              </button>
              <button 
                value="DK" 
                id="prevPreviaDK" 
                onClick={onChangePrevPrevia}
                className={
                  prevPrevia === null
                  ? "active" : ""
                }
              > 모름
              </button>
          </div>
        </div><hr className="prediction-main_sub_border_style" />


        <div className="prediction-main-item">
          <div className="left-bold">과거 임신시 임신성 당뇨<span className="left-red-point" >●</span></div>
          <div className="right">
            <button
                value="1"
                id="prevGestDmY"
                style={{ marginRight: "30px" }}
                onClick={onChangePrevGest}
                className={
                  prevGestDm === "1" 
                  ? "active" : ""
                }
                > Yes
              </button>
              <button 
                value="0" 
                id="prevGestDmN" 
                onClick={onChangePrevGest}
                style={{ marginRight: "30px" }}
                className={
                  prevGestDm === "0" 
                  ? "active" : ""
                }
              > No
              </button>
              <button 
                value="DK" 
                id="prevGestDmDK" 
                onClick={onChangePrevGest}
                className={
                  prevGestDm === null
                  ? "active" : ""
                }
              > 모름
              </button>
          </div>
        </div><hr className="prediction-main_sub_border_style" />


        <div className="prediction-main-item">
          <div className="left-bold">거대아 분만력<span className="left-red-point" >●</span></div>
          <div className="right">
            <button
                value="1"
                id="prevLgaY"
                onClick={onChangePrevLga}
                style={{ marginRight: "30px" }}
                className={
                  prevLga === "1" 
                  ? "active" : ""
                }
                > Yes
              </button>
              <button 
                value="0" 
                id="prevLgaN" 
                onClick={onChangePrevLga}
                style={{ marginRight: "30px" }}
                className={
                  prevLga === "0" 
                  ? "active" : ""
                }
              > No
              </button>
              <button 
                value="DK" 
                id="prevLgaDK" 
                onClick={onChangePrevLga}
                className={
                  prevLga === null 
                  ? "active" : ""
                }
              > 모름
              </button>
          </div>
        </div><hr className="prediction-main_sub_border_style" />








        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>

</div>
{/* --------------------------------------------------------------------------------------------------- */}
{/* --------------------------------------  과   거   력  ----------------------------------------------- */}
{/* --------------------------------------------------------------------------------------------------- */}

        <div className="prediction-main-item">
          <div className="left_empty" />
          <div className="left_title"> <h1>과거력</h1></div>
        </div>
        <hr className="prediction-main_title_border_style" />

        <div className="prediction-main-item">
          <div className="left">고혈압</div>
          <div className="right">
          <button
              value="1"
              id="phxCycleY"
              onClick={onChangePhxCycle}
              style={{ marginRight: "30px" }}
              className={
                phxCycle === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="phxCycleN" 
              onClick={onChangePhxCycle}
              style={{ marginRight: "30px" }}
              className={
                phxCycle === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="phxCycleDK" 
              onClick={onChangePhxCycle}
              className={
                phxCycle === null
                ? "active" : ""
              }
            > 모름
            </button>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">인슐린저항성관련질환<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(당뇨전단계)</div>
          <div className="right">
          <button
              value="1"
              id="igtY"
              onClick={onChangeIgt}
              style={{ marginRight: "30px" }}
              className={
                igt === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="igtN" 
              onClick={onChangeIgt}
              style={{ marginRight: "30px" }}
              className={
                igt === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="igtDK" 
              onClick={onChangeIgt}
              className={
                igt === null
                ? "active" : ""
              }
            > 모름
            </button>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left-bold">고지혈증<span className="left-red-point" >●</span></div>
          <div className="right">
          <button
              value="1"
              id="hylipidcY"
              onClick={onChangeHylipidc}
              style={{ marginRight: "30px" }}
              className={
                hylipidc === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="hylipidcN" 
              onClick={onChangeHylipidc}
              style={{ marginRight: "30px" }}
              className={
                hylipidc === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="hylipidcDK" 
              onClick={onChangeHylipidc}
              className={
                hylipidc === null
                ? "active" : ""
              }
            > 모름
            </button>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />


        <div className="prediction-main-item">
          <div className="left-bold">기타 내분비질환<span className="left-red-point" >●</span></div>
          <div className="right">
          <button
              value="1"
              id="enothY"
              onClick={onChangeEnoth}
              style={{ marginRight: "30px" }}
              className={
                enoth === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="enothN" 
              onClick={onChangeEnoth}
              style={{ marginRight: "30px" }}
              className={
                enoth === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="enothDK"
              onClick={onChangeEnoth} 
              className={
                enoth === null
                ? "active" : ""
              }
            > 모름
            </button>

            &nbsp;&nbsp;&nbsp;&nbsp;질환명 &nbsp;&nbsp;
            <input
                id="enothName"
                value={enothName}
                onChange={onChangeEnothName}
                placeholder="***"
                disabled= {
                  (enoth === "0" || enoth === null) ? true:false
                }
              />
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



      
        <div className="prediction-main-item">
          <div className="left">과거력 혹은 임신중 <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;소화기계질환</div>
          <div className="right">
          <button
              value="1"
              id="admDigestY"
              onClick={onChangeAdmDigest}
              style={{ marginRight: "30px" }}
              className={
                admDigest === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="admDigestN"
              onClick={onChangeAdmDigest}
              style={{ marginRight: "30px" }}
              className={
                admDigest === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="admDigestDK" 
              onClick={onChangeAdmDigest}
              className={
                admDigest === null
                ? "active" : ""
              }
            > 모름
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;질환명 &nbsp;&nbsp;
            <input
                id="admDigestName"
                value={admDigestName}
                onChange={onChangeAdmDigestName}
                placeholder="***"
                disabled= {
                  (admDigest === "0" || admDigest === null) ? true:false
                }
              />
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">혈액질환</div>
          <div className="right">
          <button
              value="1"
              id="admBloodY"
              onClick={onChangeAdmBlood}
              style={{ marginRight: "30px" }}
              className={
                admBlood === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="admBloodN" 
              onClick={onChangeAdmBlood}
              style={{ marginRight: "30px" }}
              className={
                admBlood === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="admBloodDK" 
              onClick={onChangeAdmBlood}
              className={
                admBlood === null
                ? "active" : ""
              }
            > 모름
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;질환명 &nbsp;&nbsp;
            <input
                id="admBloodName"
                value={admBloodName}
                onChange={onChangeAdmBloodName}
                placeholder="***"
                disabled= {
                  (admBlood === "0" || admBlood === null) ? true:false
                }
              />
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            면역질환
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
          <button
              value="1"
              id="immuneY"
              style={{ marginRight: "30px" }}
              onClick={onChangeImmune}
              className={
                immune === "1"
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="immuneN" 
              style={{ marginRight: "30px" }}
              onClick={onChangeImmune}
              className={
                immune === "0"
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="immuneDK" 
              onClick={onChangeImmune}
              className={
                immune === null
                ? "active" : ""
              }
            > 모름
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;기간 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input
                id="immuneDur"
                value={immuneDur}
                onChange={onChangeImmuneDur}
                placeholder="0"
                type="number"
                style={{ width: "75px" }}
                disabled= {
                  (immune === "0" || immune === null) ? true:false
                }

              />
              <span>개월</span>
            &nbsp;&nbsp;&nbsp;&nbsp;질환명 &nbsp;&nbsp;
            <input
                id="immuneDurName"
                value={immuneDurName}
                onChange={onChangeImmuneDurName}
                placeholder="***"
                style={{ width: "200px" }}
                disabled= {
                  (immune === "0" || immune === null) ? true:false
                }
              />
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            피부질환
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
          <button
              value="1"
              id="phxSkinY"
              onClick={onChangePhxSkin}
              style={{ marginRight: "30px" }}
              className={
                phxSkin === "1"
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="phxSkinN"
              onClick={onChangePhxSkin} 
              style={{ marginRight: "30px" }}
              className={
                phxSkin === "0"
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="phxSkinDK" 
              onClick={onChangePhxSkin}
              className={
                phxSkin === null
                ? "active" : ""
              }
            > 모름
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;질환명 &nbsp;&nbsp;
            <input
                id="phxSkinName"
                value={phxSkinName}
                onChange={onChangePhxSkinName}
                placeholder="***"
                disabled= {
                  (phxSkin === "0" || phxSkin === null) ? true:false
                }
              />
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            자궁근종개수
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
            <input
                id="myomano"
                value={myomano}
                onChange={onChangeMyomano}
                maxLength="2"
                placeholder="0"
              />
              <span>개</span>
              <font className="left-red-description">* 모를 경우 0으로 표기해주세요</font>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />


        <div className="prediction-main-item">
          <div className="left">다낭성 난소</div>
          <div className="right">
          <button
              value="1"
              id="pcosY"
              onClick={onChangePcos}
              style={{ marginRight: "30px" }}
              className={
                pcos === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="pcosN" 
              onClick={onChangePcos}
              style={{ marginRight: "30px" }}
              className={
                pcos === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="pcosDK" 
              onClick={onChangePcos}
              className={
                pcos === null
                ? "active" : ""
              }
            > 모름
            </button>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">난소 혹</div>
          <div className="right">
          <button
              value="1"
              id="phxOvarianY"
              onClick={onChangePhxOvarian}
              style={{ marginRight: "30px" }}
              className={
                phxOvarian === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="phxOvarianN" 
              onClick={onChangePhxOvarian}
              style={{ marginRight: "30px" }}
              className={
                phxOvarian === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="phxOvarianDK" 
              onClick={onChangePhxOvarian}
              className={
                phxOvarian === null
                ? "active" : ""
              }
            > 모름
            </button>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />





        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
{/* --------------------------------------------------------------------------------------------------- */}
{/* --------------------------------------  가   족   력  ----------------------------------------------- */}
{/* --------------------------------------------------------------------------------------------------- */}

        <div className="prediction-main-item">
          <div className="left_empty" />
          <div className="left_title"> <h1>가족력</h1></div>
        </div>
        <hr className="prediction-main_title_border_style" />

        <div className="prediction-main-item">
          <div className="left-bold">당뇨<span className="left-red-point" >●</span></div>
          <div className="right">
          <button
              value="1"
              id="fhxDmY"
              onClick={onChangeFhxDm}
              style={{ marginRight: "30px" }}
              className={
                fhxDm === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="fhxDmN" 
              onClick={onChangeFhxDm}
              style={{ marginRight: "30px" }}
              className={
                fhxDm === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="fhxDmDK" 
              onClick={onChangeFhxDm}
              className={
                fhxDm === null
                ? "active" : ""
              }
            > 모름
            </button>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />





        <div className="prediction-main-item">
          <div className="left">고혈압</div>
          <div className="right">
          <button
              value="1"
              id="fhxHtmY"
              onClick={onChangeFhxHtm}
              style={{ marginRight: "30px" }}
              className={
                fhxHtm === "1" 
                ? "active" : ""
              }
              > Yes
            </button>
            <button 
              value="0" 
              id="fhxHtmN" 
              onClick={onChangeFhxHtm}
              style={{ marginRight: "30px" }}
              className={
                fhxHtm === "0" 
                ? "active" : ""
              }
            > No
            </button>
            <button 
              value="DK" 
              id="fhxHtmDK" 
              onClick={onChangeFhxHtm}
              className={
                fhxHtm === null
                ? "active" : ""
              }
            > 모름
            </button>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />





        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
{/* --------------------------------------------------------------------------------------------------- */}
{/* --------------------------------------   혈액검사결과   ----------------------------------------------- */}
{/* --------------------------------------------------------------------------------------------------- */}

        <div className="prediction-main-item">
        <div className="left_empty" />
          <div className="left_title"> <h1>혈액검사결과</h1></div>
        </div>
        <hr className="prediction-main_title_border_style" />


        <div className="prediction-main-item">
        <div className="left_empty" />
          <div className="left_title"> <h3>* CBC</h3></div>
        </div>


        <div className="prediction-main-item">
          <div className="left">HB</div>
          <div className="right">
            <input
                  id="hb"
                  value={hb}
                  onChange={onChangeHb}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>g/dl</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            WBC
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
            <input
                  id="wbc"
                  value={wbc}
                  onChange={onChangeWbc}
                  maxLength="5"
                  placeholder="0"
                  type="number"
                />
                <span>10⁹/L</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">HCT</div>
          <div className="right">
            <input
                  id="hct"
                  value={hct}
                  onChange={onChangeHct}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>%</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">PLT</div>
          <div className="right">
            <input
                  id="plt"
                  value={plt}
                  onChange={onChangePlt}
                  maxLength="6"
                  placeholder="0"
                  type="number"
                />
                <span>10⁹/L</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



<br /><br /><br /><br /><br />


        <div className="prediction-main-item">
          <div className="left_empty" />
          <div className="left_title"> <h3>* BC</h3></div>
        </div>
     


        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            GFR
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
            <input
                  id="gfr"
                  value={gfr}
                  onChange={onChangeGfr}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>mg/dL</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />




        <div className="prediction-main-item">
          <div className="left">Total cholesterol</div>
          <div className="right">
            <input
                  id="tc"
                  value={tc}
                  onChange={onChangeTc}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>mg/dL</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            Cholesterol
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
            <input
                  id="hdl"
                  value={hdl}
                  onChange={onChangeHdl}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>mg/dL</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">AST</div>
          <div className="right">
            <input
                  id="ast"
                  value={ast}
                  onChange={onChangeAst}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>U/L</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



          <div className="prediction-main-item">
          <div className="left">ALT</div>
          <div className="right">
            <input
                  id="alt"
                  value={alt}
                  onChange={onChangeAlt}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>U/L</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />


        <br /><br /><br /><br /><br />


        <div className="prediction-main-item">
          <div className="left_empty" />
          <div className="left_title"> <h3>* 혈당검사</h3></div>
        </div>



        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            FBS
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
            <input
                  id="fasting100"
                  value={fasting100}
                  onChange={onChangeFasting100}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>mg/dL</span>
                <font className="left-red-description">공복혈당값이나 100g ogtt중 0분값을 입력하세요</font>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            50g GTT
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
            <input
                  id="ogtt50"
                  value={ogtt50}
                  onChange={onChangeOgtt50}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>mg/dL</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className="left">Randome glucose</div>
          <div className="right">
            <input
                  id="glucose"
                  value={glucose}
                  onChange={onChangeGlucose}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>mg/dL</span>
                <font className="left-red-description">공복혈당 외 혈당값을 입력해주세요</font>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            HbA1C 
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
            <input
                  id="hba1c"
                  value={hba1c}
                  onChange={onChangeHba1c}
                  maxLength="4"
                  placeholder="0"
                  type="number"
                />
                <span>%</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />




        <br /><br /><br /><br /><br />


        <div className="prediction-main-item">
          <div className="left_empty" />
          <div className="left_title"> <h3>* 태아스크리닝</h3>&nbsp;&nbsp;<font style={{ fontSize:15, paddingTop:43, color:'#f55d42', fontWeight:'bolder' }} >* 임신 일삼분기 데이터를 입력해주세요.</font></div>
        </div>



        <div className="prediction-main-item">
          <div className={isE0 === true ? 'left' : 'left-bold'}>
            hCG
            <span className={isE0 === true ? 'left-white-point' : 'left-red-point'} >●</span>
          </div>
          <div className="right">
            <input
                  id="hcg"
                  value={hcg}
                  onChange={onChangeHcg}
                  maxLength="6"
                  placeholder="0"
                  type="number"
                />
                <span>MoM</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />



        <div className="prediction-main-item">
          <div className='left'>PAPP-A</div>
          <div className="right">
            <input
                  id="pappa"
                  value={pappa}
                  onChange={onChangePappa}
                  maxLength="6"
                  placeholder="0"
                  type="number"
                />
                <span>MoM</span>
          </div>
        </div>
        <hr className="prediction-main_sub_border_style" />










       

       
          <div id="prevBtnDiv"  style={{display:"none"}} className="bottom-div">
            <button  className="prediction-btn" onClick={addData}>
            예측하기
          </button>
        </div>
       



        

        <div className="bottom-div" >
          Copyright 2022. Medical Excellence inc. all rights reserved.
        </div>
      </div>

    </div>
  );
};

export default Prediction;