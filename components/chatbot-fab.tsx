"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ChatCitation = {
    type: "restaurant" | "hotel";
    id: number;
    label: string;
};

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

function formatAssistantMessage(content: string) {
    return content
        .replace(/\*/g, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trimEnd();
}

function parseAssistantMessage(content: string) {
    const parts: Array<string | ChatCitation> = [];
    const pattern = /\[\[(restaurant|hotel):(\d+)\|([^\]]+)\]\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }

        parts.push({
            type: match[1] as ChatCitation["type"],
            id: Number(match[2]),
            label: match[3],
        });
        lastIndex = pattern.lastIndex;
    }

    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    return parts;
}

export default function ChatbotFab() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: "Bonjour, je peux vous aider pour les restaurants et les hotels." },
    ]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    useEffect(() => {
        const handleReservationVisibility = (event: Event) => {
            const customEvent = event as CustomEvent<{ visible?: boolean }>;
            setIsReservationOpen(Boolean(customEvent.detail?.visible));
        };

        window.addEventListener("restaurant-reservation-visibility", handleReservationVisibility);

        return () => {
            window.removeEventListener("restaurant-reservation-visibility", handleReservationVisibility);
        };
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmed = input.trim();
        if (!trimmed || isStreaming) {
            return;
        }

        const nextMessages: ChatMessage[] = [
            ...messages,
            { role: "user", content: trimmed },
            { role: "assistant", content: "" },
        ];
        setMessages(nextMessages);
        setInput("");
        setIsStreaming(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: nextMessages.slice(0, -1) }),
            });

            if (!response.ok || !response.body) {
                throw new Error("Chat stream failed");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamed = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }

                streamed += decoder.decode(value, { stream: true });
                setMessages((current) => {
                    const next = [...current];
                    next[next.length - 1] = { role: "assistant", content: streamed };
                    return next;
                });
            }
        } catch {
            setMessages((current) => {
                const next = [...current];
                next[next.length - 1] = {
                    role: "assistant",
                    content: "Je n'arrive pas a repondre pour le moment.",
                };
                return next;
            });
        } finally {
            setIsStreaming(false);
        }
    };

    if (pathname?.startsWith("/vertical")) {
        return null;
    }

    return (
        <>
            {isReservationOpen ? null : (
                <button
                    type="button"
                    aria-label="Ouvrir le chatbot"
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#c1282d] text-white shadow-[0_18px_36px_rgba(193,40,45,0.35)] transition hover:scale-[1.03] active:scale-95"
                >
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 8h10M7 12h7" strokeLinecap="round" />
                        <path d="M5 19l2.8-3H18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 1.4 1.9Z" strokeLinejoin="round" />
                    </svg>
                </button>
            )}

            {isOpen ? (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]">
                    <button
                        type="button"
                        aria-label="Fermer le chatbot"
                        className="absolute inset-0"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute bottom-0 right-0 flex h-[82vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white text-[#141414] shadow-[0_-18px_48px_rgba(0,0,0,0.18)] sm:bottom-5 sm:right-5 sm:h-[680px] sm:max-h-[calc(100vh-40px)] sm:w-[420px] sm:rounded-[28px]">
                        <div className="flex items-center justify-between border-b border-black/6 px-5 py-4">
                            <div>
                                <p className="text-[12px] uppercase tracking-[0.14em] text-black/45">Assistant</p>
                                <p className="text-[18px] font-semibold">Chatbot</p>
                            </div>
                            <button
                                type="button"
                                aria-label="Fermer le chatbot"
                                className="rounded-full p-2 transition hover:bg-black/5"
                                onClick={() => setIsOpen(false)}
                            >
                                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M18 6L6 18" strokeLinecap="round" />
                                    <path d="M6 6l12 12" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                            {messages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    className={`max-w-[86%] rounded-2xl px-4 py-3 text-[14px] leading-6 whitespace-pre-line break-words ${message.role === "user" ? "ml-auto bg-[#c1282d] text-white" : "bg-black/5 text-[#141414]"}`}
                                >
                                    {message.role === "assistant" ? (
                                        <>
                                            {parseAssistantMessage(formatAssistantMessage(message.content) || (isStreaming ? "..." : "")).map((part, partIndex) =>
                                                typeof part === "string" ? (
                                                    <span key={partIndex}>{part}</span>
                                                ) : (
                                                    <Link
                                                        key={`${part.type}-${part.id}-${partIndex}`}
                                                        href={`/${part.type}/${part.id}`}
                                                        className="font-medium text-[#c1282d] underline decoration-[#c1282d]/35 underline-offset-2"
                                                    >
                                                        {part.label}
                                                    </Link>
                                                ),
                                            )}
                                        </>
                                    ) : (
                                        message.content
                                    )}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        <form onSubmit={handleSubmit} className="border-t border-black/6 p-4">
                            <div className="flex items-end gap-2 rounded-[20px] border border-black/10 bg-black/[0.03] px-3 py-2">
                                <textarea
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    rows={1}
                                    placeholder="Demander un restaurant ou un hotel..."
                                    className="max-h-32 min-h-11 flex-1 resize-none bg-transparent py-2 text-[14px] outline-none placeholder:text-black/40"
                                />
                                <button
                                    type="submit"
                                    disabled={isStreaming || !input.trim()}
                                    className="rounded-full bg-[#141414] px-4 py-2 text-[13px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Envoyer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </>
    );
}
