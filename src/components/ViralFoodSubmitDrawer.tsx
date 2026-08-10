import { useState } from "react";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FlameIcon, CheckCircle2Icon } from "lucide-react";
import { useSubmitViralFood } from "@/hooks/useCommunityViralFoods";

export function ViralFoodSubmitDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [area, setArea] = useState("");
  const [tag, setTag] = useState("");
  const [heat, setHeat] = useState(2);
  const [submittedBy, setSubmittedBy] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);
  const submit = useSubmitViralFood();

  const resetForm = () => {
    setName("");
    setOrigin("");
    setArea("");
    setTag("");
    setHeat(2);
    setSubmittedBy("");
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        resetForm();
        setJustSubmitted(false);
      }, 300);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    submit.mutate(
      { name, origin, area, tag, heat, submittedBy: submittedBy || undefined },
      { onSuccess: () => setJustSubmitted(true) }
    );
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-w-[430px] mx-auto px-5 pb-8">
        {justSubmitted ? (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2Icon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <DrawerTitle className="font-serif text-2xl">Terkirim!</DrawerTitle>
              <DrawerDescription className="mt-1">
                Makanan viral kamu sudah muncul di daftar. Terima kasih sudah berbagi!
              </DrawerDescription>
            </div>
            <Button className="w-full h-12 rounded-xl font-semibold" onClick={() => handleClose(false)}>
              Selesai
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div>
              <DrawerTitle className="font-serif text-2xl">Tambah makanan viral</DrawerTitle>
              <DrawerDescription className="mt-1">
                Lagi rame di sekitar kamu? Kasih tau warga Sepiring lainnya.
              </DrawerDescription>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="viral-name">Nama makanan *</Label>
              <Input
                id="viral-name"
                placeholder="Contoh: Cireng Isi Rica"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={80}
                data-testid="input-viral-name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="viral-origin">Tempatnya di mana</Label>
              <Input
                id="viral-origin"
                placeholder="Contoh: Warung Bu Tini"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                maxLength={80}
                data-testid="input-viral-origin"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="viral-area">Area/kota</Label>
              <Input
                id="viral-area"
                placeholder="Contoh: Tebet, Jakarta Selatan"
                value={area}
                onChange={e => setArea(e.target.value)}
                maxLength={60}
                data-testid="input-viral-area"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="viral-tag">Kenapa viral?</Label>
              <Textarea
                id="viral-tag"
                placeholder="Contoh: Antri dari jam 5 sore, sold out tiap hari"
                value={tag}
                onChange={e => setTag(e.target.value)}
                maxLength={60}
                data-testid="input-viral-tag"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Seberapa heboh?</Label>
              <div className="flex gap-2">
                {[1, 2, 3].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setHeat(level)}
                    className={`flex-1 flex items-center justify-center gap-1 h-10 rounded-xl border-2 transition-all ${
                      heat === level ? "border-primary bg-primary/10" : "border-border text-muted-foreground"
                    }`}
                    data-testid={`button-heat-${level}`}
                  >
                    {Array.from({ length: level }).map((_, i) => (
                      <FlameIcon key={i} className={`w-4 h-4 ${heat === level ? "text-primary" : ""}`} />
                    ))}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="viral-submitter">Nama kamu (opsional)</Label>
              <Input
                id="viral-submitter"
                placeholder="Biar dapat kredit di postingan"
                value={submittedBy}
                onChange={e => setSubmittedBy(e.target.value)}
                maxLength={60}
                data-testid="input-viral-submitter"
              />
            </div>

            {submit.isError && (
              <p className="text-sm text-destructive">{(submit.error as Error).message}</p>
            )}

            <Button
              className="w-full h-12 rounded-xl font-semibold mt-1"
              disabled={!name.trim() || submit.isPending}
              onClick={handleSubmit}
              data-testid="button-submit-viral-food"
            >
              {submit.isPending ? "Mengirim..." : "Kirim"}
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
