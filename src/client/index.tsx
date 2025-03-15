import { createRoot } from "react-dom/client";
import { usePartySocket } from "partysocket/react";
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router";
import { nanoid } from "nanoid";

function App() {
  const [name] = useState(() => {
    let userName = "";
    while (!userName) {
      userName = prompt("Enter your name:")?.trim() || "";
    }
    return userName;
  });
  
  const [messages, setMessages] = useState([]);
  const { room } = useParams();

  const socket = usePartySocket({
    party: "chat",
    room,
    onMessage: (evt) => {
      const message = JSON.parse(evt.data);
      if (message.type === "add") {
        const foundIndex = messages.findIndex((m) => m.id === message.id);
        if (foundIndex === -1) {
          setMessages((messages) => [...messages, message]);
        } else {
          setMessages((messages) => {
            return messages.map((m) =>
              m.id === message.id ? message : m
            );
          });
        }
      } else {
        setMessages(message.messages);
      }
    },
  });

  return (
    <div className="chat container">
      {messages.map((message) => (
        <div key={message.id} className="row message">
          <div className="two columns user">{message.user}</div>
          <div className="ten columns">{message.content}</div>
        </div>
      ))}
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          const content = e.currentTarget.elements.namedItem(
            "content"
          ) as HTMLInputElement;
          if (!content.value.trim()) return;
          
          const chatMessage = {
            id: nanoid(8),
            content: content.value,
            user: name,
            role: "user",
          };
          
          setMessages((messages) => [...messages, chatMessage]);
          socket.send(JSON.stringify({ type: "add", ...chatMessage }));
          content.value = "";
        }}
      >
        <input
          type="text"
          name="content"
          className="ten columns my-input-text"
          placeholder="Chat"
          autoComplete="off"
        />
        <button type="submit" className="send-message two columns">
          Send
        </button>
      </form>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to={`/${nanoid()}`} />} />
      <Route path="/:room" element={<App />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);
