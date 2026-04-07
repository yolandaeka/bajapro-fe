import React, { useState } from "react";
import { Table, Button, Input, Space, Popconfirm } from "antd";
import {
  SearchOutlined,
  EyeFilled,
  EditFilled,
  DeleteFilled,
  PlusOutlined,
} from "@ant-design/icons";
import { LevelData } from "../types";

interface Props {
  data: LevelData[];
  loading: boolean;
  onAction: (action: "add" | "edit" | "view", id?: string) => void;
  onDelete: (id: string) => void;
}

export const LevelTable: React.FC<Props> = ({
  data,
  loading,
  onAction,
  onDelete,
}) => {
  const [searchText, setSearchText] = useState("");

  const columns = [
    { title: "No.", dataIndex: "no", key: "no", width: "10%" },
    { title: "Level", dataIndex: "level", key: "level", width: "20%" },
    {
      title: "Deskripsi",
      dataIndex: "deskripsi",
      key: "deskripsi",
      width: "40%",
    },
    { title: "isactive", dataIndex: "isactive", key: "isactive", width: "15%" },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: LevelData) => (
        <Space size="small">
          {/* Kirim sinyal action beserta ID-nya */}
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
            title="Hapus Level"
            description="Apakah kamu yakin ingin menghapus level ini?"
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

  const filteredData = data.filter((item) =>
    item.level.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Kirim sinyal "add" saat tombol Tambah diklik */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ backgroundColor: "#7246BA", borderRadius: "8px" }}
          onClick={() => onAction("add")}
        >
          Tambah Level
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
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />
    </>
  );
};
