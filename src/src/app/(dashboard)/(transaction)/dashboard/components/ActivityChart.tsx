import React from "react";
import { Card, Select, DatePicker, Typography, Space } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ActivityData } from "../types";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ActivityChartProps {
  data: ActivityData[];
  role: "Admin" | "Pengajar";
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, role }) => {
  const chartTitle = role === "Admin" ? "Aktivitas Pengguna (Login)" : "Aktivitas Pengumpulan Tugas";
  const legendLabel = role === "Admin" ? "Jumlah Login" : "Tugas Terkumpul";

  return (
    <Card style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <Title level={5} style={{ margin: 0 }}>{chartTitle}</Title>
        <Space wrap>
          <Select defaultValue="all" style={{ width: 120 }} options={[{ value: 'all', label: 'Pilih Kelas' }]} />
          <RangePicker style={{ width: 220 }} />
        </Space>
      </div>
      
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0f0f0" />
            <XAxis dataKey="day" axisLine={true} tickLine={false} stroke="#d9d9d9" tick={{ fill: '#8c8c8c' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c' }} />
            <Tooltip cursor={{ fill: '#f5f5f5' }} />
            <Bar dataKey="count" fill="#907afa" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, backgroundColor: "#907afa", marginRight: 8, borderRadius: 2 }}></span>
          {legendLabel}
        </Text>
      </div>
    </Card>
  );
};
