import React, { useState } from "react";
import { Input, Table, Button, Space, Tag, Popconfirm } from "antd";
import { EyeFilled, EditFilled, DeleteFilled, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { BadgeData } from "@/src/types/badge";
import Image from "next/image";

interface BadgeTableProps {
  data: BadgeData[];
  loading: boolean;
  onAction: (action: "add" | "view" | "edit", id?: string | number) => void;
  onDelete: (id: string | number) => void;
}

export const BadgeTable: React.FC<BadgeTableProps> = ({
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
      render: (text: unknown, record: BadgeData, index: number) => index + 1,
      width: 60,
    },
    {
      title: "Ikon Badge",
      dataIndex: "image",
      key: "image",
      render: (imageUrl: string) => (
        <Image
          src={imageUrl}
          alt="badge icon"
          width={40}
          height={40}
          style={{ objectFit: "contain", borderRadius: "8px" }}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=?" }}
        />
      ),
    },
    {
      title: "Nama Badge",
      dataIndex: "name",
      key: "name",
      sorter: (a: BadgeData, b: BadgeData) => a.name.localeCompare(b.name),
    },
    {
      title: "Rentang Skor",
      key: "score",
      sorter: (a: BadgeData, b: BadgeData) => a.minScore - b.minScore,
      render: (_text: unknown, record: BadgeData) => (
        <span>{record.minScore} - {record.maxScore}</span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: unknown, record: BadgeData) => (
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
            title="Hapus Badge"
            description="Apakah kamu yakin ingin menghapus badge ini?"
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
      item.name.toLowerCase().includes(keyword) ||
      item.minScore.toString().includes(keyword) ||
      item.maxScore.toString().includes(keyword) ||
      item.isactive?.toLowerCase().includes(keyword)
    );
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
          marginTop: "16px", // 👇 Tambahan biar gak nempel sama judul di atasnya
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
          Tambah Badge
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
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />
    </>
  );
};