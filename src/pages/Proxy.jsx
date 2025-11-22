// import React from 'react';


// function Proxy() {
//   return (
//     <div className="placeholder-simple">
//       <p>Прокси</p>
//     </div>
//   );
// }

// export default Proxy;
import { useState } from "react";

export default function Proxy() {
  const [input, setInput] = useState("");
  const [reversed, setReversed] = useState("");

  const handleReverse = () => {
    const lines = input
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
    setReversed(lines.reverse().join("\n"));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">🔁 Реверс списка строк</h1>

      <textarea
        className="w-full max-w-2xl h-64 p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 outline-none"
        placeholder="Вставь сюда список..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button
        onClick={handleReverse}
        className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Реверсировать
      </button>

      {reversed && (
        <div className="w-full max-w-2xl mt-6">
          <h2 className="text-lg font-semibold mb-2">Результат:</h2>
          <textarea
            className="w-full h-64 p-3 border rounded-lg shadow-sm bg-gray-50"
            value={reversed}
            readOnly
          />
        </div>
      )}
    </div>
  );
}
