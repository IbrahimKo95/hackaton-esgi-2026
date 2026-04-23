import VerticalFeed from "@/components/vertical-feed";
import { listVerticalRestaurantMedia } from "@/lib/server/vertical/service";
import { Figtree } from "next/font/google";

const figtree = Figtree({ subsets: ["latin"] });

export default async function VerticalPage() {
    const items = await listVerticalRestaurantMedia();

    return (
        <div className={figtree.className}>
            <VerticalFeed items={items} />
        </div>
    );
}
