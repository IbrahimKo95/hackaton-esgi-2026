import Image from "next/image";

type MichelinDistinction = {
    type: string;
    year?: number;
};

type MichelinDistinctionBadgeProps = {
    distinction: MichelinDistinction;
    className?: string;
    compact?: boolean;
};

const DISTINCTION_META: Record<
    string,
    { label: string; icon: string; stars?: number }
> = {
    ONE_STAR: { label: "1 étoile", icon: "/star.svg", stars: 1 },
    TWO_STARS: { label: "2 étoiles", icon: "/star.svg", stars: 2 },
    THREE_STARS: { label: "3 étoiles", icon: "/star.svg", stars: 3 },
    BIB_GOURMAND: { label: "Bib Gourmand", icon: "/bib_gourmand.svg" },
    GREEN_STAR: { label: "Étoile verte", icon: "/green_star.svg" },
    RECOMMENDED: { label: "Recommandé", icon: "/guide_icon.svg" },
};

export default function MichelinDistinctionBadge({ distinction, className, compact = false }: MichelinDistinctionBadgeProps) {
    const meta = DISTINCTION_META[distinction.type] ?? {
        label: distinction.type,
        icon: "/guide_icon.svg",
    };

    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-medium shadow-[0_6px_14px_rgba(0,0,0,0.06)]",
                compact ? "text-[11px]" : "text-[12px]",
                className ?? "",
            ].join(" ")}
        >
            <span className="inline-flex items-center gap-0.5" aria-hidden="true">
                {meta.stars
                    ? Array.from({ length: meta.stars }).map((_, index) => (
                          <Image
                              key={`${distinction.type}-${index}`}
                              src={meta.icon}
                              alt=""
                              width={12}
                              height={12}
                              className="h-3 w-3"
                              aria-hidden="true"
                          />
                      ))
                    : (
                          <Image src={meta.icon} alt="" width={12} height={12} className="h-3 w-3" aria-hidden="true" />
                      )}
            </span>
            <span>{meta.label}</span>
        </span>
    );
}
