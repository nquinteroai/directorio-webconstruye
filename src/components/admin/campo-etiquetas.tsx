"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Campo de etiquetas: Enter o coma agrega; clic en la X quita. */
export function CampoEtiquetas({
  valores,
  onCambio,
  placeholder,
  maximo = 20,
  idCampo,
}: {
  valores: string[];
  onCambio: (valores: string[]) => void;
  placeholder: string;
  maximo?: number;
  idCampo: string;
}) {
  const [texto, setTexto] = useState("");

  function agregar() {
    const limpio = texto.trim().replace(/,+$/, "");
    if (!limpio) return;
    if (valores.length >= maximo) return;
    if (valores.some((v) => v.toLowerCase() === limpio.toLowerCase())) {
      setTexto("");
      return;
    }
    onCambio([...valores, limpio]);
    setTexto("");
  }

  return (
    <div className="space-y-2">
      {valores.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {valores.map((valor) => (
            <li
              key={valor}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium"
            >
              {valor}
              <button
                type="button"
                aria-label={`Quitar ${valor}`}
                onClick={() => onCambio(valores.filter((v) => v !== valor))}
                className="grid size-4 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
              >
                <X aria-hidden className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <Input
        id={idCampo}
        value={texto}
        placeholder={valores.length >= maximo ? `Máximo ${maximo}` : placeholder}
        disabled={valores.length >= maximo}
        onChange={(e) => {
          if (e.target.value.endsWith(",")) {
            setTexto(e.target.value);
            agregar();
          } else {
            setTexto(e.target.value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            agregar();
          }
          if (e.key === "Backspace" && texto === "" && valores.length > 0) {
            onCambio(valores.slice(0, -1));
          }
        }}
        onBlur={agregar}
      />
      <p className="text-xs text-muted-foreground">
        Escribe y presiona Enter (o coma) para agregar.
      </p>
    </div>
  );
}
