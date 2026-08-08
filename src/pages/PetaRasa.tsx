import { currentUser, restaurants, recommendedRestaurants } from "@/data/sampleData";
import { CalendarIcon, UsersIcon, SparklesIcon, ChevronRightIcon } from "lucide-react";
import { useRestaurant } from "@/context/RestaurantContext";

const categoryColors: Record<string, string> = {
  "Ramen": "bg-orange-100 text-orange-800",
  "Masakan Jawa": "bg-amber-100 text-amber-800",
  "Masakan Padang": "bg-red-100 text-red-800",
  "Kopi": "bg-yellow-100 text-yellow-800",
  "Korea": "bg-pink-100 text-pink-800",
  "Dimsum": "bg-purple-100 text-purple-800",
};

function getCategoryColor(category: string) {
  return categoryColors[category] ?? "bg-muted text-muted-foreground";
}

export default function PetaRasa() {
  const { openRestaurant } = useRestaurant();
  const history = currentUser.diningHistory;

  const uniqueCategories = [...new Set(history.map(h => h.category))];

  return (
    <div className="flex flex-col gap-6 pb-8 px-5 pt-6">
      <section>
        <h2 className="font-serif text-3xl text-primary font-bold mb-1">Riwayat Makan</h2>
        <p className="text-muted-foreground text-sm">Tempat-tempat yang sudah kamu kunjungi.</p>
      </section>

      <div className="flex gap-3">
        <div className="flex-1 bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary font-serif">{history.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Tempat dikunjungi</p>
        </div>
        <div className="flex-1 bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary font-serif">{uniqueCategories.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Kategori berbeda</p>
        </div>
        <div className="flex-1 bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary font-serif">
            {history.filter(h => h.partner !== "Sendiri").length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Makan bareng</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-base">Histori kamu</h3>
        {history.map(entry => (
          <div
            key={entry.id}
            className="bg-card rounded-2xl border border-border shadow-sm p-4 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{entry.name}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${getCategoryColor(entry.category)}`}>
                  {entry.category}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap flex items-center gap-1 mt-0.5">
                <CalendarIcon className="w-3 h-3" /> {entry.date}
              </span>
            </div>
            {entry.note && (
              <p className="text-xs text-muted-foreground italic">"{entry.note}"</p>
            )}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <UsersIcon className="w-3 h-3" />
              <span>{entry.partner === "Sendiri" ? "Makan sendiri" : `Bareng ${entry.partner}`}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-[#E8B04B]" />
          <h3 className="font-semibold text-base">Rekomendasi buat kamu</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">Berdasarkan tempat yang sudah kamu kunjungi.</p>
        {recommendedRestaurants.map(rec => {
          const r = restaurants.find(x => x.id === rec.restaurantId);
          if (!r) return null;
          return (
            <button
              key={rec.restaurantId}
              onClick={() => openRestaurant(r.id)}
              className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center gap-4 text-left w-full hover:bg-muted/30 transition-colors"
              data-testid={`button-rec-resto-${r.id}`}
            >
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 text-lg font-serif font-bold">
                {r.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{r.name}</p>
                <p className="text-[11px] text-muted-foreground">{r.cuisine} · {r.area}</p>
                <p className="text-[11px] text-primary mt-0.5 italic">{rec.reason}</p>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </section>
    </div>
  );
}
