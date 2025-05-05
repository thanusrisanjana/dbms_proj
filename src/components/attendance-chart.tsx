"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  present: {
    label: "Present",
    color: "hsl(var(--chart-2))", // Use theme color
  },
  absent: {
    label: "Absent",
    color: "hsl(var(--chart-5))", // Use theme color
  },
} satisfies ChartConfig

type AttendanceChartProps = {
  attendanceSummary: { date: string; present: number; absent: number }[];
};

export const AttendanceChart = ({ attendanceSummary }: AttendanceChartProps) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartData = attendanceSummary.map((item) => {
    const dateObj = new Date(item.date);
    return {
      day: daysOfWeek[dateObj.getDay()],
      present: item.present,
      absent: item.absent,
    };
  });

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)} // Shorten day names if needed
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={10} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="present" fill="var(--color-present)" radius={4} />
        <Bar dataKey="absent" fill="var(--color-absent)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};
