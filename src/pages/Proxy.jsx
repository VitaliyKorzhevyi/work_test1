// import React from 'react';


// function Proxy() {
//   return (
//     <div className="placeholder-simple">
//       <p>Прокси</p>
//     </div>
//   );
// }

// export default Proxy;
import React, { useState } from "react";
import "./proxy.css";

export default function Proxy() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const detectTypeAndConvert = (value) => {
    const lines = value
      .split(/\n|\r|,/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const result = lines.map((line) => {
      // === Тип A: user:pass@ip:port ===
      if (line.includes("@")) {
        const [auth, host] = line.split("@");
        const [user, pass] = auth.split(":");
        const [ip, port] = host.split(":");
        const newPort = parseInt(port) + 10000;
        return `${user}:${pass}@${ip}:${newPort}`;
      }

      // === Тип B: ip:port:user:pass ===
      const parts = line.split(":");
      if (parts.length === 4) {
        const [ip, port, user, pass] = parts;
        const newPort = parseInt(port) + 1;
        return `${ip}:${newPort}:${user}:${pass}`;
      }

      return line;
    });

    setOutput(result.join("\n"));
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    detectTypeAndConvert(value);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="container">
      <h2>Proxy Converter</h2>

      <textarea
        className="input"
        placeholder="Вставь список прокси"
        value={input}
        onChange={handleChange}
      />

      <textarea
        className="output"
        readOnly
        value={output}
        onClick={copyOutput}
      />

      <button className="clear-btn" onClick={handleClear}>
        Очистить список
      </button>

      <p className="note">Нажми на нижнее поле, чтобы скопировать список.</p>
    </div>
  );
}
