import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import citizenApi from "../../api/citizenApi";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  CheckSquare,
  Layers,
  ArrowUpRight,
  } from "lucide-react";

interface MessageItem {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  data?: any;
  suggestedActions?: Array<{
    label: string;
    prompt: string;
    actionType?: "NAVIGATE" | "PROMPT" | "PREFILL" | "EXTERNAL_URL";
    url?: string;
  }>;
}

export const SetuAssistant: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [quickActions, setQuickActions] = useState<Array<{ label: string; prompt: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const initAssistant = async () => {
      setMessages([
        {
          id: "welcome-1",
          sender: "assistant",
          text: `Namaste ${user?.fullName ? user.fullName.split(" ")[0] : "Citizen"}! I am your AI-powered SETU Assistant. How may I assist you with government services, welfare schemes, or grievance redressal today?`,
          timestamp: new Date().toISOString(),
          suggestedActions: [
            { label: "Check PM-KISAN Scheme", prompt: "Tell me about PM Kisan Samman Nidhi scheme", actionType: "PROMPT" },
            { label: "Ayushman Bharat PM-JAY", prompt: "How do I check eligibility for Ayushman Bharat?", actionType: "PROMPT" },
            { label: "Apply Income Certificate", prompt: "How do I apply for an Income Certificate?", actionType: "PROMPT" },
            { label: "Report Broken Water Pipe", prompt: "I want to report a broken water pipeline causing street flooding", actionType: "PROMPT" },
          ],
        },
      ]);

      try {
        const res = await citizenApi.getAssistantQuickActions();
        if (res.success && res.data?.actions) {
          setQuickActions(res.data.actions);
        }
      } catch {
        // Fallback
      }
    };

    initAssistant();
  }, [user]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    try {
      const response = await citizenApi.chatWithAssistant({
        message: query,
        language,
      });

      if (response.success && response.data) {
        const assistantMsg: MessageItem = {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: response.data.replyText,
          timestamp: new Date().toISOString(),
          data: response.data.data,
          suggestedActions: response.data.suggestedActions,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "assistant",
            text: "I encountered an error connecting to the government services database. Please try asking again.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "Service currently offline. Please check your internet connection or browse services directly.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: { label: string; prompt: string; actionType?: string; url?: string; prefill?: any }) => {
    if (action.actionType === "EXTERNAL_URL" && action.url) {
      window.open(action.url, "_blank", "noopener,noreferrer");
    } else if (action.actionType === "NAVIGATE" && action.url) {
      setIsOpen(false);
      navigate(action.url);
    } else if (action.actionType === "PREFILL" && action.url) {
      setIsOpen(false);
      navigate(action.url, { state: { prefill: action.prefill } });
    } else {
      handleSendMessage(action.prompt);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: "Conversation refreshed. How can I help you navigate government schemes and civic services today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-xl border border-slate-700 cursor-pointer hover:bg-slate-800 transition transform hover:-translate-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "4s" }} />
            <span>{t("assistant.needHelpPrompt") || "Need Help? Ask SETU AI"}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition ring-4 ring-blue-600/20 focus:outline-none"
          title={t("assistant.name") || "SETU AI Assistant"}
          aria-label={t("assistant.name") || "SETU AI Assistant"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7 text-amber-300" />}
        </button>
      </div>

      {/* Assistant Modal Window */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 sm:inset-auto sm:right-6 sm:bottom-24 sm:w-[440px] sm:h-[640px] h-[78vh] z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 text-amber-400 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight">{t("assistant.name") || "SETU AI Assistant"}</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {t("assistant.onlineStatus") || "Online"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">{t("assistant.subtitle") || "Verified Government Navigator"}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title={t("assistant.restartChat") || "Restart chat"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={t("common.close") || "Close"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Actions Bar */}
          <div className="p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {quickActions.map((qa, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qa.prompt)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-blue-700 hover:border-blue-300 transition whitespace-nowrap shadow-2xs"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${
                  m.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {m.sender === "assistant" ? (
                  <div className="w-7 h-7 rounded-lg bg-blue-700 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] space-y-2.5 ${
                    m.sender === "user" ? "items-end text-right" : "items-start text-left"
                  }`}
                >
                  {/* Bubble text */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-blue-700 text-white rounded-tr-xs shadow-sm font-medium"
                        : "bg-white text-slate-800 rounded-tl-xs border border-slate-200 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>

                  {/* Dynamic Scheme Card */}
                  {m.data?.scheme && (
                    <div className="p-3.5 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-2.5 text-xs text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {m.data.scheme.category}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">
                          {m.data.scheme.code}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs">{m.data.scheme.name}</h4>
                      <p className="text-[11px] text-slate-600 leading-snug">{m.data.scheme.shortDescription}</p>

                      <div className="pt-1 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/citizen/schemes/${m.data.scheme.slug}`);
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition flex items-center justify-center gap-1"
                        >
                          <span>{t("assistant.exploreScheme") || "Explore Scheme"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {m.data.scheme.officialPortalUrl && (
                          <a
                            href={m.data.scheme.officialPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 transition flex items-center gap-1"
                          >
                            <span>{t("assistant.officialPortal") || "Official Portal"}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Service Card */}
                  {m.data?.service && (
                    <div className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-2.5 text-xs text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                          {m.data.service.code}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-bold">
                          {m.data.service.estimatedDays} {t("assistant.daysProcessing") || "Days Processing"}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs">{m.data.service.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">{m.data.service.description}</p>

                      <div className="pt-1 flex items-center gap-2">
                        {m.data.service.isExternal && m.data.service.officialPortalUrl ? (
                          <a
                            href={m.data.service.officialPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                          >
                            <span>{t("assistant.visitOfficialPortal") || "Visit Official Portal"}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              navigate(m.data.service.applyUrl, { state: { prefill: m.data.service.prefill } });
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                          >
                            <span>{t("assistant.applyService") || "Apply for"} {m.data.service.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Checklist Card */}
                  {m.data?.checklist && (
                    <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-2 text-xs text-left">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <CheckSquare className="w-4 h-4" />
                        <span>{t("assistant.documentChecklist") || "Document Checklist"}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{t("assistant.mandatoryProofs") || "Mandatory Proofs:"}</span>
                        {m.data.checklist.mandatoryDocuments.map((docName: string, dIdx: number) => (
                          <div key={dIdx} className="flex items-center gap-1.5 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{docName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Action Chips */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => handleActionClick(action)}
                          className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <span>{action.label}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <span>{t("assistant.thinkingMessage") || "SETU Assistant is querying official knowledge base..."}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t("assistant.promptPlaceholder") || "Ask about schemes, certificates, report problems..."}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-inner focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white flex items-center justify-center shadow-md transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SetuAssistant;
