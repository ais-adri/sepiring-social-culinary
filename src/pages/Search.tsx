import { useState } from "react";
import { partners, restaurants } from "@/data/sampleData";
import { SearchIcon, CheckCircle2Icon, MapPinIcon, UsersIcon, TagIcon } from "lucide-react";
import { useInvite } from "@/context/InviteContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { Button } from "@/components/ui/button";

type Filter = "semua" | "teman" | "tempat";

export default function Search() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const { openInvite } = useInvite();
  const { openRestaurant } = useRestaurant();

  const q = query.toLowerCase().trim();

  const matchedPartners = partners.filter(p =>
    (filter === "semua" || filter === "teman") &&
    (q === "" || p.name.toLowerCase().includes(q) || p.tasteTags.some(t => t.toLowerCase().includes(q)))
  );

  const matchedRestaurants = restaurants.filter(r =>
    (filter === "semua" || filter === "tempat") &&
    (q === "" || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) || r.area.toLowerCase().includes(q))
  );

  const filters: { key: Filter; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "teman", label: "Teman" },
    { key: "tempat", label: "Tempat" },
  ];

  return (
    <div className="flex flex-col pb-8">
      <div className="sticky top-0 bg-background/95 backdrop-blur-md px-5 pt-5 pb-3 z-10 border-b border-border">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            autoFocus
            placeholder="Cari nama teman atau tempat makan..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f.key ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              data-testid={`filter-${f.key}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-6">
        {matchedPartners.length === 0 && matchedRestaurants.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {q ? `Tidak ada hasil untuk "${query}"` : "Ketik nama teman atau tempat makan..."}
          </div>
        )}

        {matchedPartners.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <UsersIcon className="w-4 h-4" /> Teman Makan
            </h3>
            {matchedPartners.map(partner => (
              <div key={partner.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-serif font-bold text-base shrink-0">
                  {partner.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{partner.name}</span>
                    {partner.verified && (
                      <span className="inline-flex items-center gap-1 bg-sage/10 text-sage text-[10px] font-bold px-2 py-0.5 rounded-sm">
                        <CheckCircle2Icon className="w-3 h-3" /> Terverifikasi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{partner.distanceText}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {partner.tasteTags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-accent text-white rounded-xl shrink-0 text-xs h-9 px-3"
                  onClick={() => openInvite(partner.id)}
                  data-testid={`button-ajak-search-${partner.id}`}
                >
                  Ajak
                </Button>
              </div>
            ))}
          </section>
        )}

        {matchedRestaurants.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" /> Tempat Makan
            </h3>
            {matchedRestaurants.map(restaurant => (
              <button
                key={restaurant.id}
                onClick={() => openRestaurant(restaurant.id)}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4 text-left w-full hover:bg-muted/30 transition-colors"
                data-testid={`button-resto-search-${restaurant.id}`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{restaurant.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{restaurant.cuisine} · {restaurant.area}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{restaurant.openHours} · {restaurant.priceRange}</p>
                  {restaurant.promo && (
                    <div className="flex items-center gap-1 mt-1.5 bg-[#E8B04B]/15 border border-[#E8B04B]/40 rounded-md px-2 py-1 w-fit">
                      <TagIcon className="w-2.5 h-2.5 text-[#9E3F25] shrink-0" />
                      <span className="text-[10px] font-semibold text-[#9E3F25] truncate">B1G1 · {restaurant.promo}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-primary font-medium shrink-0">Lihat</span>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
