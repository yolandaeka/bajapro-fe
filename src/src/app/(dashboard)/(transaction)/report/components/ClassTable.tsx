"use client";

import { Table, Button, Typography, Card, Tag, Alert } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReport, FilteredStudent } from '../hooks/useReport'; // <-- Perhatikan path ini
import { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface ClassTableProps {
  classId: string;
}

export default function ClassTable({ classId }: ClassTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Mengambil courseId dari URL, misalnya: ?course=1
  const courseId = searchParams.get('course') || '';
  const className = searchParams.get('className') || classId; 
  const courseName = searchParams.get('courseName') || courseId;

  // Menarik data pakai Hook yang sudah kita buat
  const { data, loading, error } = useReport(classId, courseId);

  // Pastikan data dikenali sebagai array murid (FilteredStudent)
  const students = Array.isArray(data) ? (data as FilteredStudent[]) : [];
  console.log("Data Murid:", students); // Debugging: cek data yang diterima
  

  // Konfigurasi Kolom Ant Design
  const columns: ColumnsType<FilteredStudent> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nama Murid',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Total Score',
      dataIndex: 'totalScore',
      key: 'totalScore',
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="blue">Terdaftar</Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => router.push(`/report/${classId}/${record.id}?course=${courseId}`)}
        >
          Lihat Progress
        </Button>
      ),
    },
  ];

  if (error) {
    return <Alert message="Error Fetching Data" description={error} type="error" showIcon className="mb-4" />;
  }

  return (
    <div>
    <div
        className="flex justify-between items-center mb-6 shadow-sm"
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        <Button 
          color="default"
          variant="filled"
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/report")}
        >
          Kembali
        </Button>
      </div>
    <Card className="shadow-sm">
      <div className="mb-2 flex justify-between items-center">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Daftar Murid Terdaftar
        </Typography.Title>
        <Typography.Text type="secondary">
          Total: {students.length} Murid
        </Typography.Text>
      </div>

      <div className="mb-4">
        <Typography.Text type="secondary">
             Kelas {className} - Course {courseName}
        </Typography.Text>
      </div>

      <Table 
        columns={columns} 
        dataSource={students} 
        rowKey="id" 
        loading={loading}
        locale={{ emptyText: 'Tidak ada murid yang mengambil course ini di kelas tersebut' }}
        pagination={{ pageSize: 10 }}
      />
    </Card>

    </div>
  );
}