import React from "react";
import { Card, Typography, List, Avatar, Button } from "antd";
import { ApprovalItem } from "../types";
import { UserOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

interface ApprovalListProps {
  data: ApprovalItem[];
  role: "Admin" | "Pengajar";
}

export const ApprovalList: React.FC<ApprovalListProps> = ({ data, role }) => {
  const title = role === "Admin" ? "Persetujuan Pengajar Baru" : "Tugas Perlu Dinilai";

  return (
    <Card 
      style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%", display: "flex", flexDirection: "column" }}
      styles={{ body: { padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column" } }}
    >
      <Title level={5} style={{ margin: 0, marginBottom: 24 }}>{title}</Title>
      
      <div style={{ flex: 1, overflowY: "auto" }}>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Link 
                  key="detail" 
                  href={role === "Admin" ? "/approval" : "/report"} 
                  style={{ color: "#531DAB" }}
                >
                  Detail
                </Link>
              ]}
              style={{ padding: "12px 0", borderBottom: "none" }}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: "#8c8c8c" }} />}
                title={<Text strong>{item.name}</Text>}
                description={<Text type="secondary" style={{ fontSize: 12 }}>{item.context}</Text>}
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href={role === "Admin" ? "/approval" : "/report"}>
          <Button block style={{ borderRadius: 8, color: "#531DAB", borderColor: "#531DAB" }}>
            Lihat semua
          </Button>
        </Link>
      </div>
    </Card>
  );
};
