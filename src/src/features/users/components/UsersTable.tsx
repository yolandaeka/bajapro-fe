import React from "react";
import { Table, Space, Button, Tag, Popconfirm } from "antd"; 
import { EyeFilled, EditFilled, DeleteFilled, TeamOutlined } from "@ant-design/icons"; 
import { useRouter } from "next/navigation";
import { UserData } from "../types";

interface UserTableProps {
  data: UserData[];
  loading: boolean;
  currentUserRole: string;
  onAction: (action: "view" | "edit", record: UserData) => void;
  onDelete: (id: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ 
  data, 
  loading, 
  currentUserRole, 
  onAction, 
  onDelete 
}) => {
  const router = useRouter();

  const columns = [
    { 
      title: "No", 
      key: "no", 
      render: (_: unknown, __: unknown, index: number) => index + 1, 
      width: 60 
    },
    { 
      title: "Nama", 
      dataIndex: "name", 
      key: "name", 
      width: "35%", 
      sorter: (a: UserData, b: UserData) => a.name.localeCompare(b.name), 
    },
    { 
      title: "Role", 
      dataIndex: "role", 
      key: "role", 
      sorter: (a: UserData, b: UserData) => a.role.localeCompare(b.role), 
    },
    { 
      title: "Email", 
      dataIndex: "email", 
      key: "email", 
      sorter: (a: UserData, b: UserData) => a.email.localeCompare(b.email),
    },
    {
      title: "Status", 
      dataIndex: "isactive", 
      key: "isactive", 
      sorter: (a: UserData, b: UserData) => a.isactive - b.isactive, // 👈 Logika sorting angka (1 dan 0)
      render: (val: number) => (
        <Tag color={val === 1 ? "green" : "red"}>
          {val === 1 ? "Active" : "Nonactive"}
        </Tag>
      ),
    },
    {
      title: "Action", 
      key: "action",
      render: (_text: unknown, record: UserData) => (
        <Space size="small">
          {/* Tombol View */}
          <Button
            type="primary"
            style={{ backgroundColor: "#1677ff" }}
            icon={<EyeFilled />}
            onClick={() => onAction("view", record)} // Tetap pakai 'record' ya, agar form bisa langsung terisi
          />
          
          {/* Tombol Edit */}
          <Button
            type="primary"
            style={{ backgroundColor: "#facc15", color: "black" }}
            icon={<EditFilled />}
            onClick={() => onAction("edit", record)} // Tetap pakai 'record'
          />
          
          {/* Tombol Delete dengan Konfirmasi */}
          <Popconfirm
            title="Hapus User"
            description="Apakah kamu yakin ingin menghapus user ini?"
            onConfirm={() => onDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteFilled />}
            />
          </Popconfirm>
          
          {/* Tombol Lihat Murid khusus Admin ke Pengajar */}
          {currentUserRole === "Admin" && record.role === "Pengajar" && (
            <Button 
              type="primary" 
              icon={<TeamOutlined />}
              onClick={() => router.push(`/dashboard/users/pengajar/${record.id}/murid`)}
              style={{ backgroundColor: "#7246BA" }}
            >
              Lihat Murid
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table 
      dataSource={data} 
      columns={columns} 
      rowKey="id" 
      loading={loading} 
      pagination={{ pageSize: 5 }} 
      scroll={{ x: 800 }} // 👈 Mencegah tabel berantakan kalau layar kekecilan
    />
  );
};