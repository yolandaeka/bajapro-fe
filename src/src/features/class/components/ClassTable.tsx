import React from "react";
import { Table, Button, Space, Tag, Popconfirm } from "antd";
import { EyeFilled, EditFilled, DeleteFilled } from "@ant-design/icons";
import { ClassData } from "../types";

interface ClassTableProps {
  data: ClassData[];
  loading: boolean;
  onAction: (action: "view" | "edit", record: ClassData) => void;
  onDelete: (id: string) => void;
}

export const ClassTable: React.FC<ClassTableProps> = ({ data, loading, onAction, onDelete }) => {
  const columns = [
    {
      title: "No.",
      key: "index",
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Nama Kelas",
      dataIndex: "class_name",
      key: "class_name",
      sorter: (a: ClassData, b: ClassData) => a.class_name.localeCompare(b.class_name),
    },
    {
      title: "Kode Kelas",
      dataIndex: "class_code",
      key: "class_code",
      sorter: (a: ClassData, b: ClassData) => a.class_code.localeCompare(b.class_code),
    },
    {
      title: "Nama Sekolah",
      dataIndex: "school_name",
      key: "school_name",
      sorter: (a: ClassData, b: ClassData) => a.school_name.localeCompare(b.school_name),
    },
    {
      title: "Status",
      dataIndex: "isactive",
      key: "isactive",
      sorter: (a: ClassData, b: ClassData) => a.isactive - b.isactive,
      render: (isactive: number) => (
        <Tag color={isactive === 1 ? "green" : "red"}>
          {isactive === 1 ? "Active" : "Nonactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: unknown, record: ClassData) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EyeFilled />} 
            style={{ backgroundColor: "#1677ff" }} 
            onClick={() => onAction("view", record)} 
          />
          <Button 
            type="primary" 
            icon={<EditFilled />} 
            style={{ backgroundColor: "#faad14", color: "black" }} 
            onClick={() => onAction("edit", record)} 
          />
          <Popconfirm 
            title="Hapus kelas ini?" 
            onConfirm={() => onDelete(record.id)} 
            okText="Ya" 
            cancelText="Batal"
          >
            <Button type="primary" danger icon={<DeleteFilled />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={data} 
      rowKey="id" 
      loading={loading} 
      pagination={{ pageSize: 5 }} 
      scroll={{ x: 800 }} 
    />
  );
};