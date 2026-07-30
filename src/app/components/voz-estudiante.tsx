import { useEffect, useState } from "react";
import { MessageSquarePlus, Bug, Lightbulb, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "./ui/utils";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

type TipoFeedback = "sugerencia" | "error";

interface Feedback {
  id: string;
  tipo: TipoFeedback;
  texto: string;
  fecha: string;
}

const CLAVE = "epiis-feedback";

function cargar(): Feedback[] {
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Feedback[]) : [];
  } catch {
    return [];
  }
}

export function VozEstudiante() {
  const [tipo, setTipo] = useState<TipoFeedback>("sugerencia");
  const [texto, setTexto] = useState("");
  const [historial, setHistorial] = useState<Feedback[]>([]);

  useEffect(() => {
    setHistorial(cargar());
  }, []);

  const enviar = () => {
    if (!texto.trim()) {
      toast.error("Escribe tu mensaje antes de enviar.");
      return;
    }
    const nuevo: Feedback = {
      id: crypto.randomUUID(),
      tipo,
      texto: texto.trim(),
      fecha: new Date().toLocaleString("es-PE"),
    };
    const actualizado = [nuevo, ...historial];
    setHistorial(actualizado);
    localStorage.setItem(CLAVE, JSON.stringify(actualizado));
    setTexto("");
    toast.success("¡Gracias por tu voz!", {
      description: "Tu aporte ayuda a mejorar el sistema para toda la EPIIS.",
    });
  };

  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          buttonVariants({ size: "lg" }),
          "fixed bottom-5 right-5 z-40 rounded-full shadow-lg gap-2 h-12 px-5"
        )}
      >
        <MessageSquarePlus className="size-5" />
        <span className="hidden sm:inline">Voz del Estudiante</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-4 p-6">
        <SheetHeader className="p-0">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquarePlus className="size-5" />
            Voz del Estudiante
          </SheetTitle>
          <SheetDescription>
            Tu opinión construye un mejor sistema. Envía una sugerencia o reporta un error que
            encuentres.
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2">
          <Button
            variant={tipo === "sugerencia" ? "default" : "outline"}
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => setTipo("sugerencia")}
          >
            <Lightbulb className="size-4" />
            Sugerencia
          </Button>
          <Button
            variant={tipo === "error" ? "default" : "outline"}
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => setTipo("error")}
          >
            <Bug className="size-4" />
            Reportar error
          </Button>
        </div>

        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={
            tipo === "sugerencia"
              ? "Me gustaría que el horario pudiera..."
              : "Encontré un error en..."
          }
          rows={4}
        />
        <Button onClick={enviar} className="gap-1.5">
          <Send className="size-4" />
          Enviar
        </Button>

        {historial.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Tus aportes enviados
            </div>
            <ScrollArea className="flex-1 rounded-lg border">
              <div className="p-2 space-y-2">
                {historial.map((f) => (
                  <div key={f.id} className="rounded-md border p-2 bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={f.tipo === "error" ? "destructive" : "secondary"} className="text-[9px]">
                        {f.tipo === "error" ? "Error" : "Sugerencia"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{f.fecha}</span>
                    </div>
                    <div className="text-xs">{f.texto}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
