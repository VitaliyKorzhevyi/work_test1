import { useState } from "react";
import "./check.css";

export default function CheckEmail() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckEmail = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:5000/get-last-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        referrerPolicy: "no-referrer"
      });
      const data = await res.json();
      setMessage(data.email || { body: data.message });
    } catch (err) {
      setMessage({ body: "Ошибка при подключении к почте" });
    }

    setLoading(false);
  };

  return (
    <div className="email-check-container">
      <h1>Проверка последнего письма</h1>

      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleCheckEmail} disabled={loading}>
        {loading ? "Загрузка..." : "Получить последнее письмо"}
      </button>

      {message && (
        <div className="email-message">
          <p><b>От:</b> {message.from}</p>
          <p><b>Тема:</b> {message.subject}</p>
          <p><b>Дата:</b> {message.date}</p>
          <p><b>Текст письма:</b> {message.body}</p>
        </div>
      )}
    </div>
  );
}

