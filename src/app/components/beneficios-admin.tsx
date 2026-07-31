import { Building2, TrendingDown, Sparkles, Users2, Clock, ShieldCheck } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BienestarAdmin } from "./bienestar-admin";
import { Curso } from "../data/horario";
import { BloqueActividad } from "../data/actividades";

interface BeneficiosAdminProps {
  cursos: Curso[];
  actividades: BloqueActividad[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const BENEFICIOS = [
  {
    icon: TrendingDown,
    titulo: "Menos consultas por cruces de materias",
    texto:
      "Al permitir que cada estudiante arme y valide su horario detectando cruces automáticamente, la Unidad de Servicios Académicos recibe menos consultas presenciales y correos por conflictos de horas y grupos.",
  },
  {
    icon: Clock,
    titulo: "Ahorro de tiempo administrativo",
    texto:
      "La digitalización del horario oficial 2026-I elimina la interpretación manual del PDF, reduciendo el tiempo que dedican tanto estudiantes como personal a resolver dudas de matrícula.",
  },
  {
    icon: Sparkles,
    titulo: "Imagen institucional modernizada",
    texto:
      "Ofrecer una herramienta digital propia proyecta a la UNAMBA y a la EPIIS como una escuela innovadora de cara a los próximos semestres y a nuevos postulantes.",
  },
  {
    icon: Users2,
    titulo: "Fortalecimiento de la comunidad estudiantil",
    texto:
      "La función de Tiempo Libre Compartido facilita que los grupos de estudio coordinen reuniones y trabajos (como el curso de Análisis y Diseño de Sistemas), fomentando el compañerismo.",
  },
  {
    icon: ShieldCheck,
    titulo: "Datos oficiales y confiables",
    texto:
      "El sistema parte del horario aprobado por Resolución Nº 023-2026-CU-UNAMBA, garantizando que la información mostrada sea la oficial de la Dirección de la EPIIS.",
  },
];

export function BeneficiosAdmin({ cursos, actividades, trigger, open: openProp, onOpenChange }: BeneficiosAdminProps) {
  const isControlled = openProp !== undefined;

  return (
    <Dialog open={openProp} onOpenChange={onOpenChange}>
      {(!isControlled || trigger) && (
        <DialogTrigger asChild>
          {trigger || (
            <Button size="sm" variant="outline" className="gap-1.5 border-primary/20 bg-card shadow-sm hover:bg-accent">
              <Building2 className="size-4" /> <span className="hidden sm:inline">Panel administrativo</span>
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Panel de la Administración
          </DialogTitle>
          <DialogDescription>
            Valor institucional y métricas de bienestar de la EPIIS-UNAMBA.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="beneficios">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/60 p-1 rounded-lg">
            <TabsTrigger value="beneficios" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">Beneficios</TabsTrigger>
            <TabsTrigger value="bienestar" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">Bienestar y estilo de vida</TabsTrigger>
          </TabsList>
          <TabsContent value="beneficios">
            <div className="space-y-3 pt-2">
              {BENEFICIOS.map((b) => (
                <Card key={b.titulo}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <b.icon className="size-4 text-primary shrink-0" />
                      {b.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground pt-0">
                    {b.texto}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="bienestar">
            <div className="pt-2">
              <BienestarAdmin cursos={cursos} actividades={actividades} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
