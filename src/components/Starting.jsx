import React from "react";
import { useNavigate } from "react-router-dom";

const Starting = () => {
  let navigate = useNavigate();
  console.log("navigate: ", navigate);
  return (
    <div className="main-container">
      <div className="main-header">
        <span>GDM 예측 모델</span>
      </div>
      <div className="main-content">
        <button className="predict-btn" onClick={() => navigate("prediction")}>
          예측하기
        </button>
        <button className="search-btn" onClick={() => navigate("search")}>
          조회하기
        </button>
      </div>
    </div>
  );
};

export default Starting;
