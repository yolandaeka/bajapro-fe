import React, { useState } from "react";
import { Input, Table, Button, Space, Tag, Popconfirm } from "antd";
import { EyeFilled, EditFilled, DeleteFilled, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { RoleData } from "../types";

interface RoleTableProps {
  data: RoleData[];
  loading: boolean;
  onAction: (action: "add" | "view" | "edit", id?: string) => void;
  onDelete: (id: string) => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({
  data,
  loading,
  onAction,
  onDelete,
}) => {
  const [searchText, setSearchText] = useState("");
  
  const columns = [
    {
      title: "No",
      key: "index",
      render: (text: unknown, record: RoleData, index: number) => index + 1,
      width: 60,
    },
    {
      title: "Nama Role",
      dataIndex: "role_name",
      key: "role_name",
      sorter: (a: RoleData, b: RoleData) => a.role_name.localeCompare(b.role_name),
    },
    {
      title: "Status",
      dataIndex: "isactive",
      key: "isactive",
      sorter: (a: RoleData, b: RoleData) => (a.isactive || "").localeCompare(b.isactive || ""),
      render: (status: string) => (
        <Tag color={status?.toLowerCase() === "aktif" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: unknown, record: RoleData) => (
        // 👇 Ganti "middle" jadi "small" biar gak kelebaran
        <Space size="small">
          <Button
            type="primary"
            style={{ backgroundColor: "#1677ff" }}
            icon={<EyeFilled />}
            onClick={() => onAction("view", record.id)}
          />
          <Button
            type="primary"
            style={{ backgroundColor: "#facc15", color: "black" }}
            icon={<EditFilled />}
            onClick={() => onAction("edit", record.id)}
          />
          <Popconfirm
            title="Hapus Role"
            description="Apakah kamu yakin ingin menghapus role ini?"
            onConfirm={() => onDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button type="primary" danger icon={<DeleteFilled />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter((item) => {
    const keyword = searchText.toLowerCase(); 
    return (
      item.role_name.toLowerCase().includes(keyword)
    );
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
          marginTop: "16px", // 
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ backgroundColor: "#7246BA", borderRadius: "8px" }}
          onClick={() => onAction("add")}
        >
          Tambah Role
        </Button>

        <Input
          placeholder="Cari"
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          size="large"
          style={{ width: "100%", maxWidth: "300px", borderRadius: "8px" }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }} 
      />
    </>
  );
};