import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ClockIcon, MapPinIcon, BanknoteIcon, CheckCircleIcon, CalendarCheckIcon, TagIcon } from "lucide-react";
import { restaurants } from "@/data/sampleData";
import { useRestaurant } from "@/context/RestaurantContext";
import { useState } from "react";

export function RestaurantSheet() {
  const { openRestaurantId, closeRestaurant } = useRestaurant();
  const [bookingState, setBookingState] = useState<"idle" | "booked">("idle");

  const restaurant = restaurants.find(r => r.id === openRestaurantId);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeRestaurant();
      setBookingState("idle");
    }
  };

  return (
    <Drawer open={openRestaurantId !== null} onOpenChange={handleOpenChange}>
      <DrawerContent className="bg-card border-border max-w-[430px] mx-auto h-[88vh] rounded-t-2xl">
        {restaurant && (
          <div className="px-5 pt-4 pb-6 flex flex-col h-full overflow-hidden">
            <div className="mb-1">
              <DrawerTitle className="font-serif text-2xl text-foreground">
                {restaurant.name}
              </DrawerTitle>
              <DrawerDescription className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                {restaurant.cuisine}
                <span className="mx-1 text-border">·</span>
                <MapPinIcon className="w-3 h-3 inline" /> {restaurant.area}
              </DrawerDescription>
            </div>

            <div className="flex flex-wrap gap-2 my-4">
              <span className="flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                <ClockIcon className="w-3.5 h-3.5" /> {restaurant.openHours}
              </span>
              <span className="flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                <BanknoteIcon className="w-3.5 h-3.5" /> {restaurant.priceRange}
              </span>
              {restaurant.promo && (
                <span className="flex items-center gap-1.5 bg-[#E8B04B]/15 border border-[#E8B04B]/40 rounded-full px-3 py-1.5 text-xs font-semibold text-[#9E3F25]">
                  <TagIcon className="w-3.5 h-3.5 shrink-0" /> B1G1 · {restaurant.promo}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto -mx-1 px-1">
              <h3 className="font-semibold text-sm mb-3">Menu</h3>
              <div className="flex flex-col divide-y divide-border rounded-xl overflow-hidden border border-border bg-background">
                {restaurant.menu.map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.name}</p>
                      {item.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-primary shrink-0">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-auto">
              {bookingState === "booked" ? (
                <div className="flex items-center gap-3 bg-sage/10 border border-sage/20 rounded-xl p-4">
                  <CheckCircleIcon className="w-5 h-5 text-sage shrink-0" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-sage, #6F8E6A)" }}>Permintaan meja terkirim!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Restoran akan konfirmasi dalam 1–2 jam.</p>
                  </div>
                </div>
              ) : restaurant.canBook ? (
                <Button
                  className="w-full bg-primary hover:bg-accent text-white h-12 rounded-xl font-semibold flex items-center gap-2"
                  onClick={() => setBookingState("booked")}
                  data-testid={`button-pesan-meja-${restaurant.id}`}
                >
                  <CalendarCheckIcon className="w-4 h-4" /> Pesan Meja
                </Button>
              ) : (
                <div className="text-center py-3 text-xs text-muted-foreground bg-muted/40 rounded-xl">
                  Reservasi tidak tersedia — silakan datang langsung
                </div>
              )}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
