import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { listHotels } from "@/lib/server/hotel/service";
import { listRestaurants } from "@/lib/server/restaurants/service";
import { getRestaurantBudgetEstimate } from "@/lib/server/restaurants/budget";
import { z } from "zod";

export type RestaurantSearchCriteria = {
    city?: string | null;
    budgetMax?: number | null;
    cuisines: string[];
    ambiances: string[];
    keywords: string[];
};

const restaurantSearchCriteriaSchema = z.object({
    city: z.string().trim().min(1).nullable().optional(),
    budgetMax: z.number().int().positive().nullable().optional(),
    cuisines: z.array(z.string().trim().min(1)).default([]),
    ambiances: z.array(z.string().trim().min(1)).default([]),
    keywords: z.array(z.string().trim().min(1)).default([]),
});

export function getAgent() {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY environment variable");
    }

    return new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0.7,
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"
    });
}

const systemPrompt = "Tu es l'assistant d'un site de restaurants et d'hotels. Tu aides l'utilisateur a trouver des etablissements existants dans la base de donnees. Tu ne dois jamais inventer de restaurant, d'hotel, de distinction ou de note. Quand tu reponds sur un restaurant, base-toi uniquement sur les donnees fournies et reste factuel.";


const chatContextSchema = z.object({
    topic: z.enum(["restaurant", "hotel", "general"]),
    city: z.string().trim().min(1).nullable().optional(),
    needsCurrentData: z.boolean(),
});

type ChatContext = z.infer<typeof chatContextSchema>;

const chatContextPrompt = `Analyse la demande utilisateur et retourne un JSON strict.
topic vaut restaurant si la question concerne les restaurants, hotel si elle concerne les hotels, sinon general.
city contient une ville si elle est explicitement mentionnee, sinon null.
needsCurrentData vaut true si une reponse fondee sur les donnees du projet serait utile.
Ne retourne aucun texte hors JSON.`;

function getRestaurantSearchAgent() {
    if (!process.env.GROQ_API_KEY) {
        return null;
    }

    return new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0,
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    }).withStructuredOutput(restaurantSearchCriteriaSchema);
}

export async function talkToAgent(message: string) {
    const response = await getAgent().invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(message),
    ]);

    return response.content;
}

async function buildChatContext(message: string): Promise<ChatContext> {
    if (!process.env.GROQ_API_KEY) {
        return { topic: "general", city: null, needsCurrentData: false };
    }

    const agent = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0,
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    });

    try {
        const structured = agent.withStructuredOutput(chatContextSchema);

        return await structured.invoke([
            new SystemMessage(chatContextPrompt),
            new HumanMessage(message),
        ]);
    } catch {
        return { topic: "general", city: null, needsCurrentData: false };
    }
}

function normalize(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function formatRestaurantDistinction(type: string) {
    const labels: Record<string, string> = {
        ONE_STAR: "1 etoile",
        TWO_STARS: "2 etoiles",
        THREE_STARS: "3 etoiles",
        BIB_GOURMAND: "Bib Gourmand",
        GREEN_STAR: "Etoile verte",
        RECOMMENDED: "Recommande",
    };

    return labels[type] ?? type;
}

function formatHotelDistinction(type: string) {
    const labels: Record<string, string> = {
        ONE_KEY: "1 cle",
        TWO_KEYS: "2 cles",
        THREE_KEYS: "3 cles",
    };

    return labels[type] ?? type;
}

export async function interpretRestaurantSearchQuery(query: string) {
    const agent = getRestaurantSearchAgent();

    if (!agent) {
        return undefined;
    }

    try {
        return await agent.invoke([
            new SystemMessage(
                "Analyse la recherche utilisateur pour retourner seulement les criteres utiles a une recherche de restaurants."
            ),
            new HumanMessage(query),
        ]);
    } catch {
        return undefined;
    }
}

function formatRestaurantReference(restaurant: Awaited<ReturnType<typeof listRestaurants>>[number]) {
    const { average, label } = getRestaurantBudgetEstimate(restaurant.priceRange);
    const cuisines = restaurant.typesCuisine.map((item) => item.typeCuisine.libelle).join(", ") || "aucune cuisine renseignee";
    const distinctions = restaurant.distinctions.length > 0
        ? restaurant.distinctions.map((item) => formatRestaurantDistinction(item.type)).join(", ")
        : "aucune distinction";

    return `[[restaurant:${restaurant.id}|${restaurant.name}]] | ${restaurant.address.city} | budget estime ${average} EUR (${label}) | cuisines: ${cuisines} | distinctions: ${distinctions}`;
}

function formatHotelReference(hotel: Awaited<ReturnType<typeof listHotels>>[number]) {
    const keys = hotel.distinctions.length > 0
        ? hotel.distinctions.map((item) => formatHotelDistinction(item.type)).join(", ")
        : "aucune cle";

    return `[[hotel:${hotel.id}|${hotel.name}]] | ${hotel.address.city} | cles: ${keys}`;
}

export async function getChatContextSummary(message: string) {
    const context = await buildChatContext(message);

    if (!context.needsCurrentData) {
        return { context, dataSummary: "" };
    }

    const [restaurants, hotels] = await Promise.all([listRestaurants(), listHotels(context.city ?? undefined)]);
    const restaurantsForContext = context.city
        ? restaurants.filter((restaurant) => normalize(restaurant.address.city).includes(normalize(context.city ?? "")))
        : restaurants;

    const restaurantSummary = restaurantsForContext.map((restaurant) => {
        return formatRestaurantReference(restaurant);
    });

    const hotelSummary = hotels.slice(0, 6).map((hotel) => formatHotelReference(hotel));

    const dataSummary = [
        restaurantSummary.length > 0 ? `Restaurants:\n${restaurantSummary.map((entry) => `- ${entry}`).join("\n")}` : "Restaurants: aucun resultat",
        hotelSummary.length > 0 ? `Hotels:\n${hotelSummary.map((entry) => `- ${entry}`).join("\n")}` : "Hotels: aucun resultat",
    ].join("\n");

    return { context, dataSummary };
}
