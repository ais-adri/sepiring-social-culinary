import { currentUser } from "@/data/sampleData";
import { ShieldCheckIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Profil() {
  return (
    <div className="flex flex-col gap-8 pb-8 px-5 pt-6">
      {/* Header Profile */}
      <section className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center font-serif text-4xl mb-4 shadow-sm">
          AR
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">{currentUser.name}</h2>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-sage text-white text-xs font-bold px-2 py-0.5 rounded-sm">
            Terverifikasi
          </span>
        </div>
        <p className="text-muted-foreground text-sm">{currentUser.city}</p>
      </section>

      {/* Keamanan - Top Priority */}
      <section className="bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-sage" />
          <h3 className="font-serif text-xl font-semibold">Keamanan</h3>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-sm flex items-center gap-2">
            Identitas terverifikasi
          </span>
          <span className="bg-sage text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
            Aktif
          </span>
        </div>

        <div className="h-px bg-border w-full" />

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="public-meeting" className="flex-1 font-medium text-sm leading-snug">
            Selalu ketemu di tempat publik
          </Label>
          <Switch id="public-meeting" defaultChecked={currentUser.settings.alwaysPublicMeeting} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="same-gender" className="flex-1 font-medium text-sm leading-snug">
            Tampilkan saya hanya ke gender yang sama
          </Label>
          <Switch id="same-gender" defaultChecked={currentUser.settings.sameGenderOnly} />
        </div>
      </section>

      {/* Selera */}
      <section className="flex flex-col gap-4">
        <h3 className="font-serif text-xl font-semibold">Selera kamu</h3>
        <div className="flex flex-wrap gap-2">
          {currentUser.tasteTags.map(tag => (
            <span 
              key={tag} 
              className="bg-primary text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* History */}
      <section className="flex flex-col gap-4">
        <h3 className="font-serif text-xl font-semibold">Riwayat makan bareng</h3>
        <div className="flex flex-col gap-3">
          {currentUser.diningHistory.map((history, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col gap-1">
              <span className="font-bold text-sm">{history.name}</span>
              <span className="text-xs text-muted-foreground">bareng {history.partner} · {history.date}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
