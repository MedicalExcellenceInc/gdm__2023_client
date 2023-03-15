import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Prediction from "./Prediction";
import Prediction_test from "./Prediction_test";
import Search from "./Search";

const Main = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [view, setView] = useState("prediction");

  useEffect(() => {
    console.log("params: ", id);
    setView(id);
  }, [id]);

  return (
    <div className="main-container">
      <div className="main-header" onClick={() => navigate("/")}>
        <span>GDM 예측 모델</span>
      </div>
      <div className="tab">
        <button
          className={view === "prediction" ? "active" : "tablinks"}
          onClick={() => navigate("/prediction")}
        >
          예측하기
        </button>
        <button
          className={view === "search" ? "active" : "tablinks"}
          onClick={() => navigate("/search")}
        >
          조회하기
        </button>
      </div>
      <div className="main-content">
        {view === "prediction" ? <Prediction /> : (view === 'search' ? <Search /> : <Prediction_test />) }
      </div>
    </div>
  );
};

export default Main;
