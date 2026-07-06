"use client";

import { useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  aprobarResena,
  eliminarResena,
} from "@/app/admin/(panel)/resenas/acciones";

export function BotonesModeracion({
  id,
  aprobada,
}: {
  id: string;
  aprobada: boolean;
}) {
  const [pendiente, iniciarTransicion] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {!aprobada ? (
        <Button
          type="button"
          size="sm"
          disabled={pendiente}
          className="rounded-full bg-abierto text-white hover:bg-abierto/90"
          onClick={() => iniciarTransicion(async () => void (await aprobarResena(id)))}
        >
          {pendiente ? (
            <Loader2 aria-hidden className="size-3.5 animate-spin" />
          ) : (
            <Check aria-hidden className="size-3.5" />
          )}
          Aprobar
        </Button>
      ) : null}

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={pendiente}
              className="rounded-full"
            />
          }
        >
          <Trash2 aria-hidden className="size-3.5" />
          {aprobada ? "Eliminar" : "Rechazar"}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta reseña?</AlertDialogTitle>
            <AlertDialogDescription>
              La reseña se borra de forma definitiva y no se puede recuperar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                iniciarTransicion(async () => void (await eliminarResena(id)))
              }
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
