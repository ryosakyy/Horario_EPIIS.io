import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Link2, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "./ui/utils";
import { useIsMobile } from "./ui/use-mobile";
import { urlCompartir } from "../lib/compartir";

interface CompartirDialogProps {
  seleccionados: string[];
  trigger?: React.ReactNode;
}

export function CompartirDialog({ seleccionados, trigger }: CompartirDialogProps) {
  const [copiado, setCopiado] = useState(false);
  const isMobile = useIsMobile();
  const url = urlCompartir(seleccionados);
  const sinCursos = seleccionados.length === 0;
  const qrSize = isMobile ? 120 : 168;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      toast.success("Enlace copiado", { description: "Compártelo con tus compañeros." });
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1.5 border-primary/20 bg-card shadow-sm hover:bg-accent">
            <Share2 className="size-4" /> <span className="hidden sm:inline">Compartir</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Tiempo Libre Compartido
          </DialogTitle>
          <DialogDescription>
            Comparte tu horario por enlace o QR. Tus compañeros podrán cruzarlo con el suyo para
            encontrar huecos libres en común y organizar reuniones o trabajos.
          </DialogDescription>
        </DialogHeader>

        {sinCursos ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            Selecciona al menos un curso para generar tu enlace.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="rounded-xl border bg-white p-2 sm:p-3">
              <QRCodeSVG value={url} size={qrSize} level="M" />
            </div>

            <div className="w-full">
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5">
                <Link2 className="size-4 text-muted-foreground shrink-0" />
                <span className="text-xs truncate flex-1">{url}</span>
              </div>
              <Button onClick={copiar} className="w-full mt-2 gap-1.5" variant="outline">
                {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copiado ? "¡Copiado!" : "Copiar enlace"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
