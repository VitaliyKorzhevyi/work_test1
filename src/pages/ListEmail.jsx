import { useState, useEffect } from "react";
import "./ListEmail.css";

import { DownloadIcon, CopyIcon } from "./Icon";

export default function ListEmail() {
  const [rawLines, setRawLines] = useState([]);
  const [takeCount, setTakeCount] = useState(0);

  const [list1, setList1] = useState([]);
  const [list2, setList2] = useState([]);
  const [remainingLines, setRemainingLines] = useState([]);

  // -----------------------------
  //  Загрузка данных из LocalStorage
  // -----------------------------
  useEffect(() => {
    const savedRaw = JSON.parse(localStorage.getItem("rawLines") || "[]");
    const savedList1 = JSON.parse(localStorage.getItem("list1") || "[]");
    const savedList2 = JSON.parse(localStorage.getItem("list2") || "[]");
    const savedRemaining = JSON.parse(
      localStorage.getItem("remainingLines") || "[]"
    );

    if (savedRaw.length) setRawLines(savedRaw);
    if (savedList1.length) setList1(savedList1);
    if (savedList2.length) setList2(savedList2);
    if (savedRemaining.length) setRemainingLines(savedRemaining);
  }, []);

  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      console.log(copiedIndex);
      // запоминаем индекс скопированной строки
    });
  };

  // -----------------------------
  //  Автосохранение в LocalStorage
  // -----------------------------
  useEffect(() => {
    localStorage.setItem("rawLines", JSON.stringify(rawLines));
  }, [rawLines]);

  useEffect(() => {
    localStorage.setItem("list1", JSON.stringify(list1));
  }, [list1]);

  useEffect(() => {
    localStorage.setItem("list2", JSON.stringify(list2));
  }, [list2]);

  useEffect(() => {
    localStorage.setItem("remainingLines", JSON.stringify(remainingLines));
  }, [remainingLines]);

  // -----------------------------
  // Очищение всех данных
  // -----------------------------
  const handleClearAll = () => {
    if (window.confirm("Очистить все списки и начать заново?")) {
      setRawLines([]);
      setList1([]);
      setList2([]);
      setRemainingLines([]);
      setTakeCount(0);

      localStorage.removeItem("rawLines");
      localStorage.removeItem("list1");
      localStorage.removeItem("list2");
      localStorage.removeItem("remainingLines");
    }
  };

  // -----------------------------
  //  Загрузка файла
  // -----------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result;

      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      let startIndex = -1;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+/;

      for (let i = 0; i < lines.length; i++) {
        if (emailRegex.test(lines[i]) && lines[i].includes(";")) {
          startIndex = i;
          break;
        }
      }

      if (startIndex === -1) {
        alert("Не найден список email;pass;token в файле!");
        return;
      }

      const validList = [];

      for (let i = startIndex; i < lines.length; i++) {
        if (emailRegex.test(lines[i]) && lines[i].includes(";")) {
          validList.push(lines[i]);
        } else {
          break;
        }
      }

      setRawLines(validList);
    };

    reader.readAsText(file);
  };

  // -----------------------------
  //  Генерация двух списков
  // -----------------------------
  const handleGenerate = () => {
    if (takeCount <= 0 || rawLines.length === 0) return;

    const selected = rawLines.slice(0, takeCount);
    const rest = rawLines.slice(takeCount);

    const parsed = selected.map((line) => {
      const parts = line.split(";").map((p) => p.trim());
      return {
        email: parts[0] || "",
        pass: parts[1] || "",
        token: parts[2] || "",
      };
    });

    const listOneFormatted = parsed.map(
      (p) => `${p.email}  ${p.pass}  ${p.token}`
    );

    const listTwoFormatted = parsed.map(
      (p) =>
        `gmail_login: ${p.email}
gmail_pass: ${p.pass}

backup_login:
backup_pass:

2FA_URL: ${p.token}

`
    );

    setList1(listOneFormatted);
    setList2(listTwoFormatted);
    setRemainingLines(rest);
  };

  const downloadTxt = (content, filename) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload({ target: { files: [file] } });
  };
  // копирует Список №1

  const copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Copied!");
    });
  };

  // копирует Список №2

  const copySingleLine = (line) => {
    navigator.clipboard.writeText(line).then(() => {
      console.log("Line copied!");
    });
  };

  return (
    <div className="extractor-wrapper">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      ></div>
      {!rawLines.length > 0 && (
        <div
          className="file-drop-zone"
          onClick={() => document.getElementById("hiddenFileInput").click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          Кликните или перетащите сюда файл .txt
          <input
            id="hiddenFileInput"
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>
      )}

      {rawLines.length > 0 && (
        <div className="gmail-count">
          <div>
            <strong>Строк найдено:</strong> {rawLines.length}
          </div>
          <button className="btn btn-danger" onClick={handleClearAll}>
            Очистить всё
          </button>
        </div>
      )}

      {rawLines.length > 0 && (
        <div className="number-input-block" style={{ marginTop: 15 }}>
          <label>
            <input
              type="number"
              min="1"
              max={rawLines.length}
              value={takeCount}
              onChange={(e) => setTakeCount(Number(e.target.value))}
              placeholder="Сколько строк взять"
            />
          </label>

          <button className="btn" onClick={handleGenerate}>
            Сгенерировать
          </button>

          {list1.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={() =>
                downloadTxt(
                  remainingLines.join("\n"),
                  "500 Gmail Accounts 2FA.txt"
                )
              }
            >
              Скачать остаток файла
            </button>
          )}
        </div>
      )}

      {list1.length > 0 && (
        <>
          <div className="list-block">
            <div className="list-block-title">
              <h2>Список для таблицы</h2>
              <div
                className="icon-down"
                onClick={() => downloadTxt(list1.join("\n"), "list1.txt")}
              >
                <DownloadIcon />
              </div>
            </div>

            <div className="preview-box">
              {list1.join("\n")}{" "}
              <div
                onClick={() => copyText(list1.join("\n"))}
                title="Скопировать весь список"
              >
                <CopyIcon />
              </div>
            </div>
          </div>

          <div className="list-block">
            <div className="list-block-title">
              <h2>Список для Vision</h2>
              <div
                className="icon-down"
                onClick={() => downloadTxt(list2.join("\n"), "list2.txt")}
              >
                <DownloadIcon />
              </div>
            </div>

            <div>
              {list2.map((line, index) => (
                <div
                  key={index}
                  className={`preview-box ${
                    copiedIndex === index ? "highlight" : ""
                  }`}
                  onClick={() => copyToClipboard(line, index)}
                  title="Скопировать строку"
                >
                  <pre style={{ margin: 0 }}>{line}</pre>

                  <div>
                    <CopyIcon />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
