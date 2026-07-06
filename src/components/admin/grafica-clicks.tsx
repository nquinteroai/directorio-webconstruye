"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SemanaClicks } from "@/lib/queries/estadisticas";

// Orden fijo por identidad (paleta validada con el método dataviz).
const config = {
  vista_ficha: { label: "Vistas", color: "var(--chart-1)" },
  whatsapp: { label: "WhatsApp", color: "var(--chart-2)" },
  llamada: { label: "Llamadas", color: "var(--chart-3)" },
  sitio_web: { label: "Sitio web", color: "var(--chart-4)" },
  como_llegar: { label: "Cómo llegar", color: "var(--chart-5)" },
} satisfies ChartConfig;

const SERIES = Object.keys(config) as (keyof typeof config)[];

/** Barras apiladas: total de interacciones por semana y su composición. */
export function GraficaClicks({ datos }: { datos: SemanaClicks[] }) {
  return (
    <div>
      <ChartContainer config={config} className="h-72 w-full">
        <BarChart data={datos} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="semana"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={34}
            fontSize={11}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {SERIES.map((serie, i) => (
            <Bar
              key={serie}
              dataKey={serie}
              stackId="clicks"
              fill={`var(--color-${serie})`}
              stroke="var(--background)"
              strokeWidth={1}
              radius={
                i === SERIES.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]
              }
            />
          ))}
        </BarChart>
      </ChartContainer>

      {/* Vista de tabla (accesibilidad y verificación de cifras). */}
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
          Ver datos en tabla
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semana del</TableHead>
                {SERIES.map((serie) => (
                  <TableHead key={serie} className="text-right">
                    {config[serie].label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.map((fila) => (
                <TableRow key={fila.semana}>
                  <TableCell className="font-medium">{fila.semana}</TableCell>
                  {SERIES.map((serie) => (
                    <TableCell key={serie} className="text-right tabular-nums">
                      {fila[serie]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </details>
    </div>
  );
}
