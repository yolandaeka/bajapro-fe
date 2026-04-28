"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Typography,
  Card,
  Space,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeFilled,
  DeleteFilled,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { TableColumnsType } from "antd";
import { CourseRecord } from "../types";
import { handleDelete } from "../api/courseApi";
const { Title } = Typography;

export default function ListCourse({
  initialData,
}: {
  initialData: CourseRecord[];
}) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [courses, setCourses] = useState<CourseRecord[]>(initialData);
  const [loading] = useState(false);

  //   fetching data
  useEffect(() => {
    if (initialData.length === 0) {
    }
  }, [initialData]);

  const filteredCourses = courses.filter(
    (course) =>
      course.course_name.toLowerCase().includes(searchText.toLowerCase()) ||
      course.description.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns: TableColumnsType<CourseRecord> = [
    {
      title: "No.",
      key: "no",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Course",
      dataIndex: "course_name",
      key: "course_name",
      sorter: (a, b) => a.course_name.localeCompare(b.course_name),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeFilled />}
            style={{ backgroundColor: "#1677ff" }}
            onClick={() => router.push(`/course/${record.id}`)}
          >
            Detail
          </Button>
          <Popconfirm
            title="Hapus Course"
            description="Apakah kamu yakin ingin menghapus course dan isinya ini?"
            okText="Ya, Hapus"
            cancelText="Batal"
            onConfirm={() => {
              handleDelete(record.id).then(() => {
                setCourses((prev) =>
                  prev.filter((item) => item.id !== record.id),
                );
              });
            }}
          >
            <Button
              danger
              icon={<DeleteFilled />}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{ padding: 24, minHeight: "100vh", backgroundColor: "#f8fafc" }}
    >
      <Card
        style={{
          borderRadius: 16,
          border: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Title level={2} style={{ marginBottom: 8 }}>
          List Course
        </Title>
        <p style={{ color: "gray", marginBottom: "24px" }}>
          Kelola course, lesson, dan materi
        </p>

        {/* Toolbar: Tombol Tambah & Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: 24,
          }}
        >
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => router.push("/course/add")}
          >
            Tambah Course
          </Button>

          <Input
            placeholder="Cari"
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            size="large"
            style={{ width: 300, borderRadius: 8 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredCourses}
          loading={loading}
          rowKey="id"
          pagination={{
            total: filteredCourses.length,
            pageSize: 5,
            showTotal: (total) => `Total ${total} items`,
          }}
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            overflow: "hidden",
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
