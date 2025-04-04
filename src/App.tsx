import { useState } from "react";
import "./App.scss";
import { ComboBox } from "./combo-box";

const App = () => {
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  return (
    <div className="center">
      <div className="card">
        <ComboBox label="Options" selectedValues={selectedOption} onChange={(value: string[]) => setSelectedOption(value)}/>
      </div>
    </div>
  );
};

export default App;
