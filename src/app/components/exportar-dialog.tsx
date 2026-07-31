import { useState } from "react";
import { Download, FileText, FileType2, Loader2, Printer, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { BloqueActividad } from "../data/actividades";
import type { Curso } from "../data/horario";
import { exportarPDF, exportarWord } from "../lib/exportar-horario";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface ExportarDialogProps { cursos: Curso[]; actividades: BloqueActividad[]; trigger?: React.ReactNode; }

export function ExportarDialog({ cursos, actividades, trigger }: ExportarDialogProps) {
  const [abierto, setAbierto] = useState(false);
  const [pdfCargando, setPdfCargando] = useState(false);
  const vacio = cursos.length === 0 && actividades.length === 0;
  const pdf = async () => {
    setPdfCargando(true);
    try {
      await exportarPDF(cursos, actividades);
      toast.success("PDF descargado", { description: "Horario exportado en formato PDF con tabla." });
    } catch {
      toast.error("Error al generar el PDF. Inténtalo de nuevo.");
    } finally {
      setPdfCargando(false);
    }
  };
  const word = () => { exportarWord(cursos, actividades); toast.success("Documento Word descargado", { description: "Horario exportado en formato tabla. Compatible con Word y LibreOffice." }); };

  return <Dialog open={abierto} onOpenChange={setAbierto}>
    <DialogTrigger asChild>{trigger || <Button size="sm" variant="outline" className="gap-1.5 border-primary/20 bg-card shadow-sm hover:bg-accent"><Download className="size-4" /> <span className="hidden sm:inline">Exportar</span></Button>}</DialogTrigger>
    <DialogContent className="overflow-hidden border-border bg-card p-0 sm:max-w-lg">
      <div className="bg-[#1d3248] px-4 py-5 sm:px-6 sm:py-6 text-white"><div className="mb-2 sm:mb-3 flex size-8 sm:size-10 items-center justify-center rounded-xl bg-white/12"><Sparkles className="size-4 sm:size-5 text-[#f2c879]" /></div><DialogHeader><DialogTitle className="font-[Playfair_Display] text-lg sm:text-2xl font-semibold text-white">Lleva tu semana contigo</DialogTitle><DialogDescription className="max-w-sm text-slate-200 text-[11px] sm:text-sm">Preparamos una versión limpia del horario, lista para compartir, imprimir o editar.</DialogDescription></DialogHeader></div>
      <div className="space-y-2 sm:space-y-3 px-4 py-4 sm:px-6 sm:py-5">
        {vacio && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">Puedes exportar la plantilla ahora; agrega cursos para obtener tu horario completo.</p>}
        <button type="button" onClick={pdf} disabled={pdfCargando} className="group flex w-full items-center gap-3 sm:gap-4 rounded-xl border border-border p-3 sm:p-4 text-left transition-colors hover:border-primary/35 hover:bg-accent/45 disabled:opacity-50"><span className="grid size-9 sm:size-11 shrink-0 place-items-center rounded-lg bg-[#8b2635] text-white">{pdfCargando ? <Loader2 className="size-4 sm:size-5 animate-spin" /> : <FileText className="size-4 sm:size-5" />}</span><span className="min-w-0 flex-1"><span className="block text-xs sm:text-sm font-semibold">PDF (tabla)</span><span className="mt-0.5 block text-[10px] sm:text-xs leading-5 text-muted-foreground">Descarga un PDF con el horario en formato tabla, listo para imprimir.</span></span><Printer className="size-3.5 sm:size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 shrink-0" /></button>
        <button type="button" onClick={word} className="group flex w-full items-center gap-3 sm:gap-4 rounded-xl border border-border p-3 sm:p-4 text-left transition-colors hover:border-primary/35 hover:bg-accent/45"><span className="grid size-9 sm:size-11 shrink-0 place-items-center rounded-lg bg-[#eaf0f5] text-[#1d5f91]"><FileType2 className="size-4 sm:size-5" /></span><span className="min-w-0 flex-1"><span className="block text-xs sm:text-sm font-semibold">Documento Word</span><span className="mt-0.5 block text-[10px] sm:text-xs leading-5 text-muted-foreground">Descarga un .doc editable compatible con Word y LibreOffice.</span></span><Download className="size-3.5 sm:size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5 shrink-0" /></button>
      </div>
      <div className="border-t border-border bg-muted/45 px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-[11px] text-muted-foreground">Las exportaciones se generan en tu navegador. No se envía información a ningún servidor.</div>
    </DialogContent>
  </Dialog>;
}
