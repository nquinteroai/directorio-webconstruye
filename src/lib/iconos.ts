import {
  Building2,
  Coffee,
  Croissant,
  Dumbbell,
  Flower2,
  Footprints,
  Glasses,
  Hammer,
  NotebookPen,
  PawPrint,
  Pill,
  Sandwich,
  Scale,
  Scissors,
  Shirt,
  ShoppingBasket,
  ShoppingCart,
  Smartphone,
  Smile,
  Sparkles,
  Store,
  Utensils,
  WashingMachine,
  Wine,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Íconos disponibles para categorías. La columna `categorias.icono` guarda la
 * llave (nombre del ícono lucide). Si llega un nombre desconocido, se usa
 * `Store` como respaldo.
 */
export const ICONOS_CATEGORIA: Record<string, LucideIcon> = {
  Building2,
  Coffee,
  Croissant,
  Dumbbell,
  Flower2,
  Footprints,
  Glasses,
  Hammer,
  NotebookPen,
  PawPrint,
  Pill,
  Sandwich,
  Scale,
  Scissors,
  Shirt,
  ShoppingBasket,
  ShoppingCart,
  Smartphone,
  Smile,
  Sparkles,
  Store,
  Utensils,
  WashingMachine,
  Wine,
  Wrench,
};

export function iconoCategoria(nombre: string | null | undefined): LucideIcon {
  return (nombre && ICONOS_CATEGORIA[nombre]) || Store;
}
