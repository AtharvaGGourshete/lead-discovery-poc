import { ResponsiveContainer, Funnel, FunnelChart as RC, Tooltip, LabelList } from "recharts";

interface FunnelDatum {
  label: string;
  value: number;
}

export function FunnelChart({ data }: { data: FunnelDatum[] }) {
  return (
    <div className="funnel-chart">
      <ResponsiveContainer width="100%" height={300}>
        <RC>
          <Tooltip />
          <Funnel dataKey="value" data={data} isAnimationActive={false}>
            <LabelList position="right" fill="#fff" />
          </Funnel>
        </RC>
      </ResponsiveContainer>
    </div>
  );
}
