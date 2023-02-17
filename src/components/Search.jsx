import React from "react";
import searchIcon from "../lib/img/search-icon.png";
import arrowIcon from "../lib/img/downArrow-icon.png";
import trashIcon from "../lib/img/trash.png";
import axios from "axios";

// const API_HOST = 'localhost:40003';  // local
const GDM_SERVER = "https://api-gdm.icared.co.kr";

const trim = (value) => {  return value.replace(/^\s+|\s+$/g, ""); };


/**
 * 00개월 수를 넣으면 0년 0개월로 반환함.
 * @param {*} value 
 */
 const getYearMonth = (months) => {
  const value = Number(months);
  const year = Math.floor(value/12); // 나누기 몫
  const month = value%12; // 나머지값

  return {
    "year": year,
    "month": month
  }
}


const Search = (param) => {
  const [hospital, setHospital] = React.useState("");
  const [id, setId] = React.useState("");
  const [list, setList] = React.useState([]);
  const [visible, setVisible] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState("");
  
  const onChangeHospital = (e) => { setHospital(e.target.value);};
  const onChangeId = (e) => {  const value = trim(e.target.value); setId(value.toUpperCase()); };
  const onSearch = async (e) => { if (e.key === "Enter") {  setList([]); await findContents(); } };
  const focus = (msg, obj) => {  alert(msg);  obj.focus();};
  const getObject = (id) => {   return document.getElementById(id);};

  const findContents = async () => {
    if(hospital === '') focus('병원을 선택하세요.', getObject('hospital') );
    if(id === '') focus('식별번호를 확인하세요.', getObject('id') );

    const result = await axios({
      method: "get",
      url: GDM_SERVER + "/get?id_code=" + id + "&hospital=" + hospital,
      responseType: "type",
    });
    console.log(result.data);
    setList(result.data);
  };

/**
 * 예측하기 페이지에서 저장 후 param  넘기면서 들어 올때. 
 * @param {*} hospitalValue 
 * @param {*} idValue 
 */
  const findContents2 = async (hospitalValue, idValue) => {
    const result = await axios({
      method: "get",
      url: GDM_SERVER + "/get?id_code=" + idValue + "&hospital=" + hospitalValue,
      responseType: "type",
    });
    setList(result.data);
  };

  const deleteData = async (deleteId) => {
    // eslint-disable-next-line no-restricted-globals
    if(confirm("삭제하시겠습니까?")){
      const data = { id:  deleteId};
      console.log(data);
      await axios
        .post(GDM_SERVER + "/delete", data)
        .then(function (response) {
          console.log(response);
          alert("삭제되었습니다.");
          window.location.replace("/search?hospital=" + hospital + "&idCode=" + id);
        })
        .catch(function (error) {
          console.log(error);
          alert(error + " : 삭제하지 못하였습니다.");
        });
    }
  }

  const onChangeVisible = (id) => {
    console.log('key:' + id);
    const obj = document.getElementById(id);
    if (obj.style.display === "none") obj.style.display = "block";
    else obj.style.display = "none";
  };

  React.useEffect( () => {
    const temp = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {  temp[key] = value; });

    if(temp.hospital != null) {
      setHospital(temp.hospital);
      setId(temp.idCode);
      document.getElementById('hospital').value = temp.hospital;
      findContents2(temp.hospital, temp.idCode);
    }
    
  }, []);

  return (
    <div className="content-container">
      <div className="search-main">
        <div className="search-wrapper">
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
          <div className="input-box">
            <div style={{ width: "60px", height: "60px", margin: "10px" }}>
              <img src={searchIcon} style={{ width: "100%", height: "100%" }} />
            </div>
            <input
              placeholder="환자식별번호를 입력해주세요"
              style={{ border: "none" }}
              value={id}
              onChange={onChangeId}
              onKeyPress={onSearch}
            />
          </div>
        </div>

        <div className="info-box">
        <div style={{ marginRight: "80px" }}>{`식별번호: `}{id}</div>
          <div>{`병원: `}{hospital}</div>
        </div>

        {list.map((el, key) => (
          <div className="content-box"   key={key}>
            <div className="head-info">
              <div>
              {el.date}  기준 GDM 확률{" "}
                <span style={{ color: "#FF8575" }}>{el.result}%</span> 로 예측됩니다. 
                
              </div>
              <div onClick={(e) => onChangeVisible(key)}>
              <span style={{ color: "#989898" , fontSize: 18, verticalAlign: "middle", alignItems: "right"}}>{el.ai_model_version}</span>&nbsp;&nbsp;&nbsp;&nbsp;
                <img
                  src={arrowIcon}
                  width="32px"
                  style={{ transform: visible && "rotate(180deg)" , verticalAlign: "middle", alignItems: "right"}}
                />
              </div>
            </div>



            {
              <div id={key} className="content" style={{ display: "none" }}>




{/*  기본정보 항목 시작 */}
                <div className="content-table-title">기본 정보</div>
                <table
                  className="content-table"
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                        산모나이
                      </td>
                      <td width={"25%"} align="center">
                        {el.mother_age} {`세`}
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                        임신주수
                      </td>
                      <td width={"25%"} align="center">
                        <div>
                        {el.crnt_gest_weeks_w}
                          {`주 `}
                          {el.crnt_gest_weeks_d}
                          {`일`}
                        </div>
                        <div>
                          {`(EDC: `}
                          {el.edc}
                          {` )`}
                        </div>
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      과거임신횟수
                      </td>
                      <td width={"75%"} align="center" colSpan={3}>
                        {el.gest_cnt}회
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      만삭분만횟수
                      </td>
                      <td width={"25%"} align="center">
                        {el.ftpn}회
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                       조산횟수
                      </td>
                      <td width={"25%"} align="center">
                      {el.pbmh}회
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      자연유산횟수
                      </td>
                      <td width={"25%"} align="center">
                      {el.natural_mc_cnt}회
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      인공유산횟수
                      </td>
                      <td width={"25%"} align="center">
                      {el.artificial_mc_cnt}회
                      </td>
                    </tr>
                  </tbody>
                </table>





{/* 기본정보 하위 항목 시작 */}
                <table
                  className="content-table"
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      현재 임신중인 태아의 수
                      </td>
                      <td width={"75%"} align="center" colSpan={3}>
                      {el.twin_kind}
                      {
                        el.twin_kind !== '' ?
                        " 명" : "-"
                      }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      임신 전 키
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.mother_height !== '' ?
                        el.mother_height + " cm" : "-"
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      체중(BMI)
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.mother_original_weight !== '' ?
                        el.mother_original_weight + " kg" : "-"
                      }
                      {
                        el.mother_original_bmi !== ''  ?
                        ' (' + el.mother_original_bmi + ')' : ''
                      }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      혈압(MAP)
                      </td>
                      <td width={"25%"} align="center">

                      {
                        el.sbp !== '' && el.dbp !== '' ?
                        el.sbp + '/' + el.dbp + ' mmHg (' + el.map + ')' : '-'
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      맥박
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.hr !== '' ?
                        el.hr + ' 회': '-'
                      }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      흡연여부
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.smoking === "1" ? "Y" : (el.smoking === "0" ? "N": (el.smoking === 'DK' ? '모름':'-' ))
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      현재임신 프로게스테론 사용기간
                      </td>
                      <td width={"25%"} align="center">
                        {
                          el.vpg_dur !== '' ?
                          el.vpg_dur + ' 주' : '-'
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>




{/* 경산모 항목 시작 */}
              <div className="content-table-title">경산모</div>
                <table
                  className="content-table"
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      생존아 수
                      </td>
                      <td width={"25%"} align="center">
                        {
                          el.survch !== '' ?
                          el.survch + ' 명' : '-'
                        }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      제왕절개 수술 횟수
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.csec !== '' ?
                          el.csec + ' 회' : '-'
                        }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      과거 임신시 전치태반
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.prev_previa === "1" ? "Y" : (el.prev_previa === "0" ? "N": (el.prev_previa === 'DK' ? '모름':'-' ))
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      과거 임신시 임신성 당뇨병
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.prev_gest_dm === "1" ? "Y" : (el.prev_gest_dm === "0" ? "N": (el.prev_gest_dm === 'DK' ? '모름':'-' ))
                      }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      거대아 분만력
                      </td>
                      <td width={"75%"} align="center" colSpan={3}>
                      {
                        el.prev_lga === "1" ? "Y" : (el.prev_lga === "0" ? "N": (el.prev_lga === 'DK' ? '모름':'-' ))
                      }
                      </td>
                    </tr>
                  </tbody>
                </table>






{/* 과거력 항목 시작 */}
<div className="content-table-title">과거력</div>
                <table
                  className="content-table"
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      고혈압
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.phx_cycle === "1" ? "Y" : (el.phx_cycle === "0" ? "N": (el.phx_cycle === 'DK' ? '모름':'-' ))
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      고지혈증
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.hylipidc === "1" ? "Y" : (el.hylipidc === "0" ? "N": (el.hylipidc === 'DK' ? '모름':'-' ))
                      }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      인슐린 저항성 관련 질환<br />(당뇨 전단계)
                      </td>
                      <td width={"75%"} align="center" colSpan={3}>
                      {
                        el.igt === "1" ? "Y" : (el.igt === "0" ? "N": (el.igt === 'DK' ? '모름':'-' ))
                      }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      기타 내분비질환
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.enoth === "1" ? "Y" +  "/" + el.enoth_name : (el.enoth === "0" ? "N": (el.enoth === 'DK' ? '모름':'-' ))
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      소화기계 질환
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.adm_digest === "1" ? "Y" +  "/" + el.adm_digest_name : (el.adm_digest === "0" ? "N": (el.adm_digest === 'DK' ? '모름':'-' ))
                      }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      혈액질환
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.adm_blood === "1" ? "Y" +  "/" + el.adm_blood_name : (el.adm_blood === "0" ? "N": (el.adm_blood === 'DK' ? '모름':'-' ))
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      면역질환
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.immune === "1" ? "Y/" + getYearMonth(el.immune_dur).year +"년 "+ getYearMonth(el.immune_dur).month +"개월" + (el.immune_dur_name === '' || el.immune_dur_name === null ? "":"/" + el.immune_dur_name) : (el.immune === "0" ? "N": (el.immune === 'DK' ? '모름':'-' ))

                      }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      피부질환
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.phx_skin === "1" ? "Y/" + el.phx_skin_name : (el.phx_skin === "0" ? "N": (el.phx_skin === 'DK' ? '모름':'-' ))
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      자궁근종개수
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.myomano !== '' ?
                          el.myomano + ' 개' : '-'
                        }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      다낭성 난소
                      </td>
                      <td width={"25%"} align="center">

                      {
                        el.pcos === "1" ? "Y" : (el.pcos === "0" ? "N": (el.pcos === 'DK' ? '모름':'-' ))
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      난소 혹
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.phx_ovarian === "1" ? "Y" : (el.phx_ovarian === "0" ? "N": (el.phx_ovarian === 'DK' ? '모름':'-' ))
                      }
                      </td>
                    </tr>
                  </tbody>
                </table>





{/* 가족력 항목 시작 */}
              <div className="content-table-title">가족력</div>
                <table
                  className="content-table"
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      당뇨병
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.fhx_dm === "1" ? "Y" : (el.fhx_dm === "0" ? "N": (el.fhx_dm === 'DK' ? '모름':'-' ))
                      }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      고혈압
                      </td>
                      <td width={"25%"} align="center">
                      {
                        el.fhx_htm === "1" ? "Y" : (el.fhx_htm === "0" ? "N": (el.fhx_htm === 'DK' ? '모름':'-' ))
                      }
                      </td>
                    </tr>
                  </tbody>
                </table>






{/* 혈액검사결과 항목 시작 */}
{/* CBC */}
                <div className="content-table-title">혈액검사결과</div><br />
                <div className="content-table-title">&nbsp;&nbsp;&nbsp;&nbsp;CBC</div>
                <table
                  className="content-table"
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      HB
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.hb !== '' ?
                          el.hb + ' g/dl' : '-'
                        }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      WBC
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.wbc !== '' ?
                          el.wbc + ' 10⁹/L' : '-'
                        }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      HCT
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.hct !== '' ?
                          el.hct + ' %' : '-'
                        }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      PLT
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.plt !== '' ?
                          el.plt + ' 10⁹/L' : '-'
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>







{/* BC 항목 시작 */}

                <div className="content-table-title">&nbsp;&nbsp;&nbsp;&nbsp;BC</div>
                <table
                  className="content-table"
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      eGFR
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.gfr !== '' ?
                          el.gfr + ' mg/dL' : '-'
                        }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      Total cholesterol
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.tc !== '' ?
                          el.tc + ' mg/dL' : '-'
                        }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      Cholesterol
                      </td>
                      <td width={"75%"} align="center" colSpan={3}>
                      {
                          el.hdl !== '' ?
                          el.hdl + ' mg/dL' : '-'
                        }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      AST
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.ast !== '' ?
                          el.ast + ' U/L' : '-'
                        }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      ALT
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.alt !== '' ?
                          el.alt + ' U/L' : '-'
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>          






{/* 혈당검사 항목 시작 */}
                <div className="content-table-title">&nbsp;&nbsp;&nbsp;&nbsp;혈당검사</div>
                <table
                  className="content-table"
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      FBS
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.fasting_100 !== '' ?
                          el.fasting_100 + ' mg/dL' : '-'
                        }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      50g GTT
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.ogtt_50 !== '' ?
                          el.ogtt_50 + ' mg/dL' : '-'
                        }
                      </td>
                    </tr>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      Randome glucose
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.glucose !== '' ?
                          el.glucose + ' mg/dL' : '-'
                        }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      HbA1C 
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.hba1c !== '' ?
                          el.hba1c + ' %' : '-'
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>








{/* 태아스크리닝 항목 시작 */}
                <div className="content-table-title">&nbsp;&nbsp;&nbsp;&nbsp;태아스크리닝</div>
                <table
                  className="content-table"
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                    <tr align="center">
                      <td width={"25%"} align="center" className="title-column">
                      hCG
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.hcg !== '' ?
                          el.hcg + ' MoM' : '-'
                        }
                      </td>
                      <td width={"25%"} align="center" className="title-column">
                      PAPP-A
                      </td>
                      <td width={"25%"} align="center">
                      {
                          el.pappa !== '' ?
                          el.pappa + ' MoM' : '-'
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>





                <table
                  border="1"
                  bordercolor="#f0f0f0"
                  width="100%"
                  style={{ marginTop: 30, marginBottom: 60 }}
                >
                  <tbody>
                  <tr align="center">
                    <td width={"25%"} align="center" >
                      <img src={trashIcon} style={{ width: "4%", height: "4%", cursor: "pointer" }} onClick={() => deleteData(el.id)} />
                    </td>
                    </tr>
                  </tbody>
                </table>


              </div>
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
