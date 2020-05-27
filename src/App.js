import React from "react";
import { deposit, redeem } from "./web3Service";

function App() {
  return (
    <div>
      <h3> Aave Test </h3>
      <React.Fragment>
        {""}
        <button
          onClick={() =>
            deposit("1", "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
          }
          size="small"
        >
          Deposit
        </button>
        <button
          onClick={() =>
            redeem("0.1", "0xD483B49F2d55D2c53D32bE6efF735cB001880F79")
          }
          size="small"
        >
          Redeem
        </button>
      </React.Fragment>
    </div>
  );
}

export default App;
