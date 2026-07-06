import { Skeleton } from "@/components/ui/skeleton";

export function TarjetaSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-full" />
      </div>
    </div>
  );
}

export function GrillaTarjetasSkeleton({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cantidad }, (_, i) => (
        <TarjetaSkeleton key={i} />
      ))}
    </div>
  );
}
