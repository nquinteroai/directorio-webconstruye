import { Encabezado } from "@/components/publico/encabezado";
import { Pie } from "@/components/publico/pie";

export default function LayoutPublico({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Encabezado />
      <div className="flex-1">{children}</div>
      <Pie />
    </div>
  );
}
