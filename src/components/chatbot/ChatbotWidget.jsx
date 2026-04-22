import React, { useEffect, useRef, useState } from "react";
import { CircleUserRound, Send, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

const WELCOME_MESSAGE = "Bun venit în aplicația noastră! Cum îți putem fi de folos?";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: WELCOME_MESSAGE }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Nu esti autentificat.");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Eroare la chatbot");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "Nu am putut genera un raspuns." },
      ]);
    } catch (error) {
      toast.error(error.message || "Eroare la trimiterea mesajului");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Momentan nu pot raspunde. Te rog incearca din nou." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-6 bottom-6 z-[60] flex items-end gap-3">
      {!isOpen && (
        <div className="hidden md:flex items-center h-12 px-4 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 text-sm">
          Te pot ajuta cu ceva?
        </div>
      )}

      {isOpen && (
        <div className="w-[360px] max-w-[calc(100vw-3rem)] h-[520px] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="h-14 px-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-baby-light to-baby-dark flex items-center justify-center">
                <CircleUserRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Asistent AI</p>
                <p className="text-xs text-slate-500">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Inchide chatbot"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={`${msg.role}-${idx}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      isUser ? "bg-baby-dark text-white" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2.5 text-sm bg-slate-100 text-slate-500">
                  Scriu un raspuns...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Scrie un mesaj..."
                className="flex-1 h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-baby-blue/50 focus:border-baby-blue transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="w-11 h-11 rounded-xl bg-baby-dark hover:bg-baby-blue disabled:opacity-50 text-white flex items-center justify-center transition-colors"
                aria-label="Trimite mesaj"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-baby-light to-baby-dark text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        aria-label="Deschide chatbot AI"
      >
        <CircleUserRound className="w-7 h-7" />
      </button>
    </div>
  );
}
