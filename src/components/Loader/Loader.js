import React from "react";
import "./Loader.css"; // Certifique-se de que o arquivo CSS está no mesmo diretório ou ajuste o caminho

const Loader = () => {
  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12"></feGaussianBlur>
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"></feColorMatrix>
        </filter>
      </svg>
      <div className="loader"></div>
    </>
  );
};

export default Loader;
