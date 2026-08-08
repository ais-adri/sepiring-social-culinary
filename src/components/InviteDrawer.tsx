import { useInvite } from "@/context/InviteContext";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { partners, currentUser, restaurants } from "@/data/sampleData";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UsersIcon, CheckCircleIcon, ZapIcon, ShoppingBagIcon } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";

export function InviteDrawer() {
  const { state, closeInvite, reset } = useInvite();
  const partner = partners.find(p => p.id === state.partnerId);
  const [, setLocation] = useLocation();
  const shouldReduceMotion = useReducedMotion();

  if (state.step === "sent" && partner) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 text-center max-w-[430px] mx-auto">
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircleIcon className="w-12 h-12 text-primary" />
        </motion.div>
        <h2 className="font-serif text-3xl text-primary mb-3">Ajakan terkirim!</h2>
        <p className="text-muted-foreground mb-8">
          {partner.name} akan dikabarin. Kami kasih tau kamu kalau dia merespons.
        </p>
        <Button
          className="w-full bg-primary hover:bg-accent text-white h-12 text-lg rounded-xl"
          onClick={() => { reset(); setLocation("/"); }}
          data-testid="button-selesai"
        >
          Selesai
        </Button>
      </div>
    );
  }

  const handleClose = () => {
    closeInvite();
    setTimeout(() => { if (state.step !== "sent") reset(); }, 300);
  };

  if (!partner) return null;

  return (
    <Drawer open={state.isOpen && state.step !== "sent"} onOpenChange={open => !open && handleClose()}>
      <DrawerContent className="bg-card border-border max-w-[430px] mx-auto h-[85vh] rounded-t-2xl">
        <div className="px-5 pt-4 pb-6 flex flex-col h-full overflow-hidden">
          <DrawerTitle className="font-serif text-2xl text-foreground mb-1">
            Ajak {partner.name.split(" ")[0]} makan
          </DrawerTitle>
          <DrawerDescription className="text-muted-foreground font-medium text-sm mb-6">
            Langkah {state.step} dari 3
          </DrawerDescription>
          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6">
            {state.step === 1 && <Step1 partner={partner} />}
            {state.step === 2 && <Step2 />}
            {state.step === 3 && <Step3 partner={partner} />}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Step1({ partner }: { partner: ReturnType<typeof partners[0]["id"] extends number ? typeof partners.find : never> & object }) {
  const { state, setRestaurant, setStep } = useInvite();
  const sharedRestaurantIds = currentUser.wishlist.filter(id => (partner as typeof partners[0]).wishlistIds.includes(id));
  const sharedRestaurants = restaurants.filter(r => sharedRestaurantIds.includes(r.id));

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">Mau ke mana?</h3>
      <div className="flex-1 flex flex-col gap-3">
        {sharedRestaurants.length > 0 ? (
          sharedRestaurants.map(r => (
            <div
              key={r.id}
              onClick={() => setRestaurant(r.id)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${state.selectedRestaurantId === r.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              data-testid={`select-resto-${r.id}`}
            >
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-muted-foreground">{r.cuisine} · {r.area}</div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">Belum ada wishlist yang sama. Kamu bisa ajak ke tempat lain dulu.</p>
        )}
      </div>
      <div className="pt-4 mt-auto">
        <Button
          className="w-full bg-primary hover:bg-accent text-white h-12 rounded-xl"
          disabled={!state.selectedRestaurantId}
          onClick={() => setStep(2)}
        >
          Lanjut &rarr;
        </Button>
      </div>
    </div>
  );
}

const modeOptions = [
  {
    key: "eat-and-go",
    label: "Eat & Go",
    desc: "Makan, selesai, nggak ada kewajiban lanjut.",
    Icon: ZapIcon,
  },
  {
    key: "eat-and-play",
    label: "Eat & Play",
    desc: "Makan dulu, habis itu jalan-jalan atau nongkrong bareng.",
    Icon: ShoppingBagIcon,
  },
  {
    key: "teman-tetap",
    label: "Teman makan tetap",
    desc: "Cari teman makan yang bisa rutin bareng.",
    Icon: UsersIcon,
  },
];

function Step2() {
  const { state, setMode, setStep } = useInvite();

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">Modenya gimana?</h3>
      <div className="flex-1 flex flex-col gap-3">
        {modeOptions.map(({ key, label, desc, Icon }) => (
          <div
            key={key}
            onClick={() => setMode(key)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex gap-4 ${state.selectedMode === key ? "border-primary bg-primary/5" : "border-border bg-card"}`}
            data-testid={`mode-${key}`}
          >
            <div className="bg-primary/10 p-3 rounded-full h-fit">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-base mb-0.5">{label}</div>
              <div className="text-sm text-muted-foreground">{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-4 mt-auto">
        <p className="text-xs mb-4" style={{ color: "#6F8E6A" }}>Kami selalu rekomendasiin ketemu di tempat publik.</p>
        <Button
          className="w-full bg-primary hover:bg-accent text-white h-12 rounded-xl"
          disabled={!state.selectedMode}
          onClick={() => setStep(3)}
        >
          Lanjut &rarr;
        </Button>
      </div>
    </div>
  );
}

function Step3({ partner }: { partner: typeof partners[0] }) {
  const { state, setTime, setStep } = useInvite();
  const [customDate, setCustomDate] = useState("");

  const handleTimeSelect = (val: string) => { setTime(val); setCustomDate(""); };

  const timeOptions = ["Minggu ini", "Minggu depan", "Tentukan sendiri"];

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">Kapan?</h3>
      <div className="flex-1 flex flex-col gap-3">
        {timeOptions.map(opt => (
          <Button
            key={opt}
            variant="outline"
            onClick={() => handleTimeSelect(opt)}
            className={`h-12 rounded-xl border-2 justify-start px-4 font-normal text-base ${state.selectedTime === opt ? "border-primary text-primary bg-primary/5" : "border-border"}`}
            data-testid={`time-${opt.replace(/ /g, "-").toLowerCase()}`}
          >
            {opt}
          </Button>
        ))}
        {state.selectedTime === "Tentukan sendiri" && (
          <input
            type="date"
            className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
            value={customDate}
            onChange={e => setCustomDate(e.target.value)}
            data-testid="input-custom-date"
          />
        )}
        <div className="mt-2 rounded-xl p-4 border" style={{ background: "#6F8E6A18", borderColor: "#6F8E6A30" }}>
          <p className="text-sm font-medium" style={{ color: "#6F8E6A" }}>
            Selalu di tempat publik · Kontak tidak dibagikan sampai kedua pihak setuju
          </p>
        </div>
      </div>
      <div className="pt-4 mt-auto">
        <Button
          className="w-full bg-primary hover:bg-accent text-white h-12 rounded-xl text-lg font-semibold"
          disabled={!state.selectedTime || (state.selectedTime === "Tentukan sendiri" && !customDate)}
          onClick={() => setStep("sent")}
          data-testid="button-kirim-ajakan"
        >
          Kirim ajakan
        </Button>
      </div>
    </div>
  );
}
