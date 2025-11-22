import React, { useState, useEffect } from "react";
import "./reserv.css";

import { DownloadIcon, CopyIcon } from "./Icon";

export default function Reserv() {
  const [fileContent, setFileContent] = useState("");
  const [lines, setLines] = useState([]);
  const [topText, setTopText] = useState("");
  const [count, setCount] = useState(10);
  const [newListText, setNewListText] = useState("");
  const [list2, setList2] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // -----------------------------------------------------------
  // ЗАГРУЗКА ИЗ LOCALSTORAGE ПРИ СТАРТЕ
  // -----------------------------------------------------------
  useEffect(() => {
    const savedContent = localStorage.getItem("fileContent");
    const savedLines = JSON.parse(localStorage.getItem("lines") || "[]");
    const savedTopText = localStorage.getItem("topText") || "";
    const savedNewList = localStorage.getItem("newListText") || "";
    const savedList2 = JSON.parse(localStorage.getItem("list3") || "[]");

    if (savedContent) setFileContent(savedContent);
    if (savedLines.length) setLines(savedLines);
    if (savedTopText) setTopText(savedTopText);
    if (savedNewList) setNewListText(savedNewList);
    if (savedList2.length) setList2(savedList2);
  }, []);

// -----------------------------------------------------------
// ОЧИСТКА ВСЕГО
// -----------------------------------------------------------
const handleClearAll = () => {
  if (window.confirm("Вы уверены, что хотите очистить все данные?")) {
    setFileContent("");
    setLines([]);
    setTopText("");
    setNewListText("");
    setList2([]);
    setCount(10);
    setCopiedIndex(null);

    localStorage.removeItem("fileContent");
    localStorage.removeItem("lines");
    localStorage.removeItem("topText");
    localStorage.removeItem("newListText");
    localStorage.removeItem("list3");
  }
};


  // -----------------------------------------------------------
  // ЗАГРУЗКА ФАЙЛА
  // -----------------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (ev) => {
      const text = ev.target.result;
      setFileContent(text);
      localStorage.setItem("fileContent", text);

      const allLines = text.split(/\r?\n/).map((l) => l.trim());
      const firstListIndex = allLines.findIndex(
        (l) => l.split("|").length >= 3
      );

      if (firstListIndex === -1) {
        setTopText(text);
        setLines([]);

        localStorage.setItem("topText", text);
        localStorage.setItem("lines", JSON.stringify([]));
      } else {
        const top = allLines.slice(0, firstListIndex).join("\n");
        const list = allLines.slice(firstListIndex);

        setTopText(top);
        setLines(list);

        localStorage.setItem("topText", top);
        localStorage.setItem("lines", JSON.stringify(list));
      }
    };

    reader.readAsText(file);
  };

  // -----------------------------------------------------------
  // СКАЧАТЬ ФАЙЛ
  // -----------------------------------------------------------
  const downloadTxt = (content, filename) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -----------------------------------------------------------
  // СКАЧАТЬ ОСТАТОК ФАЙЛА
  // -----------------------------------------------------------
  const handleOldList = () => {
    if (lines.length === 0) return;

    const num = parseInt(count);
    if (isNaN(num) || num <= 0) return;

    const remainingLines = lines.slice(num);

    const oldList = topText + "\n" + remainingLines.join("\n");
    downloadTxt(oldList, "резерв.txt");
  };

  // -----------------------------------------------------------
  // СКАЧАТЬ НОВЫЙ СПИСОК
  // -----------------------------------------------------------
  const handleNewList = () => {
    downloadTxt(newListText, "new-list.txt");
  };

  // -----------------------------------------------------------
  // КОПИРОВАНИЕ СПИСКА
  // -----------------------------------------------------------
  const handleCopyNewList = async () => {
    if (!newListText) return;
    try {
      await navigator.clipboard.writeText(newListText);
      alert("Новый список скопирован!");
    } catch (e) {
      console.error("Ошибка при копировании", e);
    }
  };

  // -----------------------------------------------------------
  // DRAG & DROP
  // -----------------------------------------------------------
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

  // -----------------------------------------------------------
  // СОЗДАНИЕ newListText + list2
  // -----------------------------------------------------------
  const newList = () => {
    const num = parseInt(count);
    if (isNaN(num) || num <= 0) return;

    const selectedLines = lines.slice(0, num);
    const newList = selectedLines
      .map((line) => {
        const parts = line.split("|");
        return parts.length >= 2 ? `${parts[0]}  ${parts[1]}` : line;
      })
      .join("\n");

    setNewListText(newList);
    localStorage.setItem("newListText", newList);

    const savedList2 = JSON.parse(localStorage.getItem("list2") || "[]");

    const backupList = newList
      .trim()
      .split("\n")
      .map((line) => line.trim().split(/\s+/));

    const merged = savedList2.map((entry, index) => {
      const [backupLogin = "", backupPass = ""] = backupList[index] || [];

      return entry
        .replace(/backup_login:.*/g, `backup_login: ${backupLogin}`)
        .replace(/backup_pass:.*/g, `backup_pass: ${backupPass}`);
    });

    setList2(merged);
    localStorage.setItem("list3", JSON.stringify(merged));
  };

  // -----------------------------------------------------------
  // КОПИЯ ОДНОЙ ЛИНИИ list2
  // -----------------------------------------------------------
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
    });
  };

  // -----------------------------------------------------------
  // UI
  // -----------------------------------------------------------
  return (
    <div className="list-split-container">
      {!lines.length > 0 && (
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

      {lines.length > 0 && (
        <>
          <div className="gmail-count">
            <div className="list-split-info">
              Строк найдено: {lines.length - 1}
            </div>
            <button className="btn btn-danger" onClick={handleClearAll}>
              Очистить всё
            </button>
          </div>

          <div className="list-split-controls">
            <label>
              <input
                type="number"
                min="1"
                max={lines.length}
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </label>

            {list2.length > 0 && (
              <>
                <button onClick={handleNewList} className="list-split-btn">
                  Скачать список
                </button>
                <button onClick={handleOldList} className="list-split-btn">
                  Скачать остаток файла
                </button>
              </>
            )}
          </div>

          <button className="list-split-btn" onClick={newList}>
            Сформировать список и заметки
          </button>

          {newListText && (
            <div
              className="list-split-preview"
              onClick={handleCopyNewList}
              title="Кликните, чтобы скопировать новый список"
            >
              <div className="list-split-lines">
                {newListText.split("\n").map((line, idx) => (
                  <div key={idx} className="list-split-line">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="list-block">
            {newListText && (
              <div className="list-block-title">
                <h2>Список для Vision заметок</h2>
                <div
                  className="icon-down"
                  onClick={() => downloadTxt(list2.join("\n"), "list2.txt")}
                >
                  <DownloadIcon />
                </div>
              </div>
            )}

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
