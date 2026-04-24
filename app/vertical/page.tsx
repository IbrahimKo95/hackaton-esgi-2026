import VerticalFeed from "@/components/vertical-feed";
import { listVerticalRestaurantMedia } from "@/lib/server/vertical/service";

export default async function VerticalPage() {
    const items = await listVerticalRestaurantMedia();

    return (
        <div className="font-[var(--font-figtree)]">
            <VerticalFeed items={items} />
        </div>
    );
}
