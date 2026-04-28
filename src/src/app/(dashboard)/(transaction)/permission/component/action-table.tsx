"use client";

import React, { useState, useEffect } from "react";
import { Table, Checkbox, Card, Row, Col, Button, Typography, Tag } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { PermissionRow } from "../types"; 

const { Title, Text } = Typography;

// List fitur yang mau kita munculkan di tabel (Bisa ditaruh di constant)
const FEATURES = ["Course", "Users", "Kelas", "Leaderboard"];
const ACTIONS = ["create", "read", "update", "delete"];

export const PermissionTab = () => {
  const [selectedRole, setSelectedRole] = useState<string>("Admin");
  const [rolePermissions, setRolePermissions] = useState<number[]>([]); // ID permission yang aktif


  const dataSource: PermissionRow[] = FEATURES.map((feat) => {
    const row: PermissionRow = { feature: feat, key: feat };
    ACTIONS.forEach((act) => {
      row[act] = Math.floor(Math.random() * 1000); // Ganti dengan ID asli dari API
    });
    return row;
  });

  const columns = [
    {
      title: "Nama",
      dataIndex: "feature",
      key: "feature",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    ...ACTIONS.map((action) => ({
      title: action.charAt(0).toUpperCase() + action.slice(1),
      dataIndex: action,
      key: action,
      align: "center" as const,
      render: (id: number) => (
        <Checkbox 
          checked={rolePermissions.includes(id)}
          onChange={(e) => {
            if (e.target.checked) setRolePermissions([...rolePermissions, id]);
            else setRolePermissions(rolePermissions.filter(p => p !== id));
          }}
        />
      ),
    })),
  ];

  return (
    <div style={{ padding: 24, background: "#F8FAFC", minHeight: "100vh" }}>
      <Row gutter={24}>
        {/* Kolom Kiri: List Role */}
        <Col span={8}>
          <Card title="List Role System" style={{ borderRadius: 16 }}>
            <Table
              dataSource={[
                { id: 1, name: "Admin" },
                { id: 2, name: "Pengajar" },
                { id: 3, name: "Pelajar" },
              ]}
              columns={[
                { title: "Role", dataIndex: "name", key: "name" },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record) => (
                    <Button 
                      type={selectedRole === record.name ? "primary" : "default"}
                      onClick={() => setSelectedRole(record.name)}
                    >
                      Detail
                    </Button>
                  ),
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>

        {/* Kolom Kanan: Manajemen Akses */}
        <Col span={16}>
          <Card 
            title={<span>Manajemen Akses : <Text color="purple">{selectedRole}</Text></span>}
            extra={<Button type="primary" icon={<SaveOutlined />} style={{ backgroundColor: '#5B21B6' }}>Save</Button>}
            style={{ borderRadius: 16 }}
          >
            <Table 
              dataSource={dataSource} 
              columns={columns} 
              pagination={false}
              bordered={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};