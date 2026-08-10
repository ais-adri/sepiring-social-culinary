import { useState, useEffect } from "react";
import { currentUser, partners, restaurants } from "@/data/sampleData";
import { useViralFoods } from "@/hooks/useViralFoods";
import { useCommunityViralFoods } from "@/hooks/useCommunityViralFoods";
import { ViralFoodSubmitDrawer } from "@/components/ViralFoodSubmitDrawer";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, MapPinIcon, UtensilsIcon, ZapIcon, ShoppingBagIcon, ChevronRightIcon, FlameIcon, PlusIcon } from "lucide-react";
import { useInvite } from "@/context/InviteContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { imageMap } from "@/assets/imageMap";

const COMMITMENT_OPTIONS = [
  { key: "eat-and-go", label: "Eat & Go", Icon: ZapIcon },
  { key: "eat-and-play", label: "Eat & Play", Icon: ShoppingBagIcon },
];

const CRAVINGS = [
  "makanan pedas",
  "ramen kuah kental",
  "matcha latte",
  "martabak telur",
  "dimsum pagi",
  "sate maranggi",
  "es krim unik",
  "nasi padang",
  "kopi spesialti",
  "topokki keju",
];

function RotatingCraving() {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % CRAVINGS.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center mt-1 px-4 py-1 bg-primary/10 rounded-full border border-primary/20 overflow-hidden min-w-0">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          className="italic font-bold text-primary whitespace-nowrap"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {CRAVINGS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Home() {
  const [genderFilter, setGenderFilter] = useState<"semua" | "perempuan" | "laki-laki">("semua");
  const [commitments, setCommitments] = useState<Record<number, string>>({});
  const { openInvite } = useInvite();
  const { openRestaurant } = useRestaurant();
  const [, setLocation] = useLocation();
  const { data: viralFoods = [] } = useViralFoods();
  const { data: communityViralFoods = [] } = useCommunityViralFoods();
  const [isSubmitDrawerOpen, setIsSubmitDrawerOpen] = useState(false);
  const allViralFoods = [...communityViralFoods, ...viralFoods];

  const filteredPartners = partners.filter(p =>
    genderFilter === "semua" ? true : p.gender === genderFilter
  );

  const setCommitment = (partnerId: number, c: string) =>
    setCommitments(prev => ({ ...prev, [partnerId]: prev[partnerId] === c ? "" : c }));

  return (
    <div className="flex flex-col gap-8 pb-8">
      <section className="relative overflow-hidden">
        <img
          src={imageMap["hero-dining"]}
          alt="Teman makan bareng"
          className="w-full h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        <div className="px-5 pt-4 pb-2 relative">
          <h2 className="font-serif text-4xl text-foreground leading-tight mb-2">
            Lihat siapa yang lagi craving{" "}
            <RotatingCraving />{" "}
            seperti kamu!
          </h2>
          <p className="text-muted-foreground text-sm mt-4 max-w-[280px] leading-relaxed">
            Ketemu teman makan yang seleranya sama. Nggak ada kewajiban lanjut.
          </p>
        </div>
      </section>

      <section className="px-5">
        <div className="flex gap-2 mb-3 flex-wrap">
          {(["semua", "perempuan", "laki-laki"] as const).map(filter => {
            const isSafety = filter !== "semua";
            const active = genderFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setGenderFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  active
                    ? isSafety ? "bg-sage text-white shadow-sm" : "bg-primary text-white shadow-sm"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                {filter === "semua" ? "Semua" : filter === "perempuan" ? "Perempuan saja" : "Laki-laki saja"}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] font-medium" style={{ color: "#6F8E6A" }}>
          Filter aman: hanya tampilkan teman makan dengan gender yang kamu pilih.
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <div className="px-5 flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl font-semibold">Teman makan yang cocok</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Selera mirip kamu, siap makan bareng</p>
          </div>
        </div>

        <div className="px-5 flex flex-col gap-5">
          {filteredPartners.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 border border-border text-center flex flex-col items-center shadow-sm">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <UtensilsIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-bold text-lg mb-2">Belum ada teman makan di sini</h4>
              <p className="text-muted-foreground text-sm mb-6">
                Wajar kalau di awal masih sepi. Kami sedang mengundang lebih banyak orang.
              </p>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl font-semibold border-2"
                onClick={() => setLocation("/peta-rasa")}
                data-testid="button-buka-peta-rasa"
              >
                Lihat Riwayat Makan
              </Button>
            </div>
          ) : (
            filteredPartners.map(partner => {
              const selectedCommitment = commitments[partner.id] ?? "";
              return (
                <div key={partner.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shrink-0">
                      {partner.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base truncate">{partner.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {partner.verified && (
                          <span className="inline-flex items-center gap-1 bg-sage/10 text-[#6F8E6A] text-[10px] font-bold px-2 py-0.5 rounded-sm">
                            <CheckCircle2Icon className="w-3 h-3" /> Terverifikasi
                          </span>
                        )}
                        <span className="text-muted-foreground text-xs">{partner.distanceText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${partner.matchLevel === "Sangat cocok" ? "bg-[#E8B04B]/20 text-[#2A211C]" : "bg-orange-100 text-orange-900"}`}
                    >
                      {partner.matchLevel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{partner.matchReason}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {partner.tasteTags.map(tag => {
                      const isMatch = currentUser.tasteTags.includes(tag);
                      return (
                        <span
                          key={tag}
                          className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${isMatch ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"}`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2 pt-1 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium">Pilih komitmen:</p>
                    <div className="flex gap-2">
                      {COMMITMENT_OPTIONS.map(({ key, label, Icon }) => (
                        <button
                          key={key}
                          onClick={() => setCommitment(partner.id, key)}
                          className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border-2 text-xs font-semibold transition-all ${
                            selectedCommitment === key
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                          data-testid={`commitment-${key}-${partner.id}`}
                        >
                          <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full bg-primary hover:bg-accent text-white h-12 rounded-xl font-semibold shadow-sm"
                      onClick={() => openInvite(partner.id, null, selectedCommitment || null)}
                      data-testid={`button-ajak-makan-${partner.id}`}
                    >
                      Ajak makan
                    </Button>
                    <div className="text-center">
                      <span className="text-[10px] font-medium" style={{ color: "#6F8E6A" }}>
                        Ketemu di tempat publik · kontak privat dulu
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="mx-5 border-t border-border" />

      <section className="flex flex-col gap-1">
        <div className="px-5 mb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <FlameIcon className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-xl font-semibold">Makanan viral sekarang</h3>
            </div>
            <p className="text-xs text-muted-foreground">Lagi rame diperbincangkan · dari YouTube & warga Sepiring</p>
          </div>
          <button
            onClick={() => setIsSubmitDrawerOpen(true)}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            aria-label="Tambah makanan viral"
            data-testid="button-open-add-viral-food"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x px-5 hide-scrollbar">
          {allViralFoods.map(food => {
            const CardTag = food.videoUrl ? "a" : "div";
            const imageSrc = food.image ? (food.image.startsWith("http") ? food.image : imageMap[food.image]) : undefined;
            return (
            <CardTag
              key={food.id}
              className="bg-card rounded-2xl border border-border shadow-sm min-w-[180px] max-w-[180px] snap-center shrink-0 flex flex-col overflow-hidden"
              {...(food.videoUrl ? { href: food.videoUrl, target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <div className="relative h-28 bg-muted overflow-hidden">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                    <UtensilsIcon className="w-8 h-8 text-primary/50" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                  {Array.from({ length: food.heat }).map((_, i) => (
                    <FlameIcon key={i} className="w-3 h-3 text-primary" />
                  ))}
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1.5">
                <p className="font-bold text-sm leading-tight">{food.name}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {food.origin} · {food.area}
                </p>
                <span className="inline-block self-start text-[10px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full mt-1">
                  {food.tag}
                </span>
              </div>
            </CardTag>
            );
          })}
        </div>
      </section>

      <div className="mx-5 border-t border-border" />

      <section className="flex flex-col gap-1">
        <div className="px-5 mb-4">
          <h3 className="font-serif text-xl font-semibold">Rekomendasi tempat makan</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Berdasarkan selera kamu dan teman sekitar</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-0 px-5 hide-scrollbar">
          {restaurants.map(restaurant => (
            <button
              key={restaurant.id}
              onClick={() => openRestaurant(restaurant.id)}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm min-w-[260px] snap-center shrink-0 text-left hover:bg-muted/30 transition-colors flex flex-col gap-3"
              data-testid={`button-resto-card-${restaurant.id}`}
            >
              <div>
                <h4 className="font-bold text-base truncate">{restaurant.name}</h4>
                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                  {restaurant.cuisine} · <MapPinIcon className="w-3 h-3 inline" /> {restaurant.area}
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-muted/50 rounded-lg p-2 text-xs font-medium flex items-center gap-2">
                  <span>👥</span> {restaurant.socialProof} orang juga mau ke sini
                </div>
                {restaurant.similarTasteBadge && (
                  <div className="bg-[#E8B04B]/10 text-amber-900 rounded-lg p-2 text-xs font-medium flex items-start gap-2">
                    <span>✨</span> <span>Orang dengan selera mirip baru ke sini</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">{restaurant.openHours}</span>
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  Lihat menu <ChevronRightIcon className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
      <ViralFoodSubmitDrawer open={isSubmitDrawerOpen} onOpenChange={setIsSubmitDrawerOpen} />
    </div>
  );
}
