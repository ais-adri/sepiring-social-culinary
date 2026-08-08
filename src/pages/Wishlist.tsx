import { currentUser, restaurants, partners } from "@/data/sampleData";
import { Button } from "@/components/ui/button";
import { MapPinIcon, ChevronRightIcon, TagIcon } from "lucide-react";
import { useInvite } from "@/context/InviteContext";
import { useRestaurant } from "@/context/RestaurantContext";

export default function Wishlist() {
  const { openInvite } = useInvite();
  const { openRestaurant } = useRestaurant();

  const wishlistRestaurants = restaurants.filter(r => currentUser.wishlist.includes(r.id));

  return (
    <div className="flex flex-col gap-6 pb-8 px-5 pt-6">
      <section>
        <h2 className="font-serif text-3xl text-primary font-bold mb-2">Wishlist Kamu</h2>
        <p className="text-muted-foreground text-sm">Tempat-tempat yang pengin kamu coba.</p>
      </section>

      <div className="flex flex-col gap-4">
        {wishlistRestaurants.map(restaurant => {
          const interestedPartners = partners.filter(p => p.wishlistIds.includes(restaurant.id));

          return (
            <div key={restaurant.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-lg">{restaurant.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  {restaurant.cuisine} · <MapPinIcon className="w-3 h-3" /> {restaurant.area}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{restaurant.openHours} · {restaurant.priceRange}</p>
                {restaurant.promo && (
                  <div className="flex items-center gap-1.5 mt-2 bg-[#E8B04B]/15 border border-[#E8B04B]/40 rounded-lg px-2.5 py-1.5 w-fit">
                    <TagIcon className="w-3 h-3 text-[#9E3F25] shrink-0" />
                    <span className="text-[11px] font-semibold text-[#9E3F25]">B1G1 · {restaurant.promo}</span>
                  </div>
                )}
              </div>

              {interestedPartners.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                  <p className="text-xs font-medium mb-2 text-foreground">Juga mau ke sini:</p>
                  <div className="flex flex-wrap gap-2">
                    {interestedPartners.map(p => (
                      <div key={p.id} className="flex items-center gap-2 bg-card px-2 py-1 rounded-full border border-border shadow-xs">
                        <div className="w-5 h-5 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                          {p.avatar}
                        </div>
                        <span className="text-xs font-medium">{p.name.split(" ")[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-2 border-border flex items-center gap-1.5 text-sm font-semibold"
                  onClick={() => openRestaurant(restaurant.id)}
                  data-testid={`button-lihat-menu-${restaurant.id}`}
                >
                  <ChevronRightIcon className="w-4 h-4" /> Lihat menu
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-accent text-white h-11 rounded-xl font-semibold"
                  onClick={() => {
                    if (interestedPartners.length > 0) {
                      openInvite(interestedPartners[0].id, restaurant.id);
                    }
                  }}
                  disabled={interestedPartners.length === 0}
                  data-testid={`button-ajak-kesini-${restaurant.id}`}
                >
                  Ajak ke sini
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
