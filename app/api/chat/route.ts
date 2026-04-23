import { getChatContextSummary, getAgent } from "@/lib/server/agent";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

type ChatInputMessage = {
    role: "user" | "assistant";
    content: string;
};

type ChatCitation = {
    type: "restaurant" | "hotel";
    id: number;
    label: string;
};

function sanitizeStreamContent(content: string) {
    return content
        .replace(/\*/g, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n");
}

export function extractChatCitations(content: string) {
    const citations: ChatCitation[] = [];

    const cleaned = content.replace(/\[\[(restaurant|hotel):(\d+)\|([^\]]+)\]\]/g, (_, type: ChatCitation["type"], id: string, label: string) => {
        citations.push({ type, id: Number(id), label });
        return label;
    });

    return { content: cleaned, citations };
}

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as { messages?: ChatInputMessage[] };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

        if (!lastUserMessage.trim()) {
            return Response.json({ error: "Missing message" }, { status: 400 });
        }

        const { context, dataSummary } = await getChatContextSummary(lastUserMessage);
        const agent = getAgent();

        const prompt = [
            "Tu es l'assistant d'un site de restaurants et d'hotels.",
            "Reponds en francais, de facon utile, factuelle et concise.",
            "N'invente jamais de restaurant, d'hotel, de note, de distinction ou de concept qui n'existe pas dans les donnees.",
            "Pour les hotels, parle des cles de distinction, pas des etoiles.",
            "Pour les restaurants, prixRange represente une estimation de budget moyen ou une fourchette, jamais un prix exact.",
            "Pour les restaurants, il n'existe pas de note 5 etoiles. Les distinctions reelles sont ONE_STAR, TWO_STARS, THREE_STARS, BIB_GOURMAND, GREEN_STAR et RECOMMENDED.",
            "Si l'utilisateur demande '3 etoiles' pour un restaurant, explique la correspondance avec THREE_STARS ou precise qu'il n'y a pas de note etoilee si la donnee ne le permet pas.",
            "Ne cite que des restaurants et hotels presentes dans les donnees fournies.",
            "Quand tu cites un restaurant ou un hotel, ecris le nom sous la forme [[restaurant:id|Nom]] ou [[hotel:id|Nom]] pour permettre au client de le rendre cliquable.",
            "Quand tu cites plusieurs restaurants, separe chaque restaurant par un paragraphe vide.",
            "N'utilise pas de markdown, pas de listes a puces et pas d'asterisques.",
            context.topic === "restaurant" ? "La demande concerne les restaurants." : "",
            context.topic === "hotel" ? "La demande concerne les hotels." : "",
            dataSummary ? `Donnees projet:\n${dataSummary}` : "",
        ].filter(Boolean).join("\n\n");

        const stream = await agent.stream([
            new SystemMessage(prompt),
            ...messages.map((message) =>
                message.role === "user"
                    ? new HumanMessage(message.content)
                    : new AIMessage(message.content),
            ),
        ]);

        const encoder = new TextEncoder();

        const readable = new ReadableStream<Uint8Array>({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = typeof chunk.content === "string"
                            ? chunk.content
                            : Array.isArray(chunk.content)
                                ? chunk.content
                                    .map((part) => (typeof part === "string" ? part : ""))
                                    .join("")
                                : "";

                        const sanitized = sanitizeStreamContent(content);

                        if (sanitized) {
                            controller.enqueue(encoder.encode(sanitized));
                        }
                    }
                } catch (error) {
                    controller.error(error);
                    return;
                }

                controller.close();
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            },
        });
    } catch {
        return Response.json({ error: "Chat unavailable" }, { status: 500 });
    }
}
