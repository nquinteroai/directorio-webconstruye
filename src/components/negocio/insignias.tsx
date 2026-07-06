import { BadgeCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function InsigniaDestacado({ className }: { className?: string }) {
  return (
    <Badge className={cn("gap-1 bg-primary text-primary-foreground", className)}>
      <Star aria-hidden className="size-3 fill-current" />
      Destacado
    </Badge>
  );
}

export function InsigniaVerificado({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      title={`Verificado por ${siteConfig.agenciaNombre}`}
      className={cn(
        "gap-1 border-primary/40 bg-primary/5 text-primary",
        className,
      )}
    >
      <BadgeCheck aria-hidden className="size-3.5" />
      Verificado
    </Badge>
  );
}
