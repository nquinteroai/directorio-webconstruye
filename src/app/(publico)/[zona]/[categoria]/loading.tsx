import { GrillaTarjetasSkeleton } from "@/components/publico/esqueletos";
import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoZona() {
  return (
    <div className="contenedor space-y-6 py-6">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-3/4 max-w-xl" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>
      <GrillaTarjetasSkeleton />
    </div>
  );
}
