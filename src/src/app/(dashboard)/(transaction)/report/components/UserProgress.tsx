"use client";
import { Table, Tag, Button, Card } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReport } from '../hooks/useReport';

export default function UserPorgress({ classId, userId }: { classId: string, userId: string }) {
  const router = useRouter();
  const courseId = useSearchParams().get('course');
  const { data: progress, loading } = useReport(undefined, userId, undefined, courseId || '');

  const columns = [
    { title: 'Sub Lesson', dataIndex: 'sub_lesson_name' },
    { title: 'Wondering', dataIndex: 'wondering_score', align: 'center' as const },
    { title: 'Exploring', dataIndex: 'exploring_score', align: 'center' as const },
    { 
      title: 'Status', 
      dataIndex: 'status',
      align: 'center' as const,
      render: (status: string) => (
        <Tag color={status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange'}>
          {status?.toUpperCase() || 'PENDING'}
        </Tag>
      )
    },
    { 
      title: 'Action', 
      render: (record: any) => (
        <Button onClick={() => router.push(`/report/${classId}/${userId}/${record.sub_lesson_id}?course=${courseId}`)}>
          Grade
        </Button>
      ) 
    },
  ];

  return (
    <Card title="Progress Belajar Murid" className="shadow-sm">
      <Table dataSource={progress} columns={columns} loading={loading} rowKey="id" />
    </Card>
  );
}