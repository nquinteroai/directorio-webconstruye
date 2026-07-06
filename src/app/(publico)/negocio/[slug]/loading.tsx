import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoNegocio() {
  return (
    <div className="contenedor space-y-6 pt-4">
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-52 w-full rounded-2xl sm:h-64 md:h-80" />
      <div className="flex items-start gap-4">
        <Skeleton className="size-16 rounded-xl sm:size-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-2/3 max-w-sm" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="hidden h-64 rounded-xl lg:block" />
      </div>
    </div>
  );
}
