"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Button, Table, Tag, Spin, message } from "antd";
import { ArrowLeftOutlined, StarFilled, WalletFilled, ClockCircleFilled, FolderFilled } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { getStudentCourseReportApi } from "../../api/studentApi";

const { Title, Text } = Typography;

export default function StudentReportOverview() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params?.courseId);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let studentId = 5;
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1];
    if (userCookie) {
      try {
        const u = JSON.parse(decodeURIComponent(userCookie).replace(/^"|"$/g, ''));
        studentId = u.id;
      } catch (e) {}
    } else {
      const lsUser = localStorage.getItem("user");
      if (lsUser) {
        try {
          studentId = JSON.parse(lsUser).id;
        } catch (e) {}
      }
    }

    if (courseId) {
      fetchReportData(studentId, courseId);
    }
  }, [courseId]);

  const fetchReportData = async (studentId: number, cId: number) => {
    try {
      setLoading(true);
      const res = await getStudentCourseReportApi(studentId, cId);
      setData(res);
    } catch (e) {
      console.error(e);
      message.error("Gagal memuat data report.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  if (!data) return null;

  const columns = [
    {
      title: 'No',
      dataIndex: 'index',
      key: 'index',
      render: (text: any, record: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: 'Sub Lesson',
      dataIndex: ['sublesson', 'title'],
      key: 'title',
      render: (text: string) => <Text style={{ color: '#595959' }}>{text}</Text>,
    },
    {
      title: 'Total Score',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (val: number) => <Text style={{ color: '#595959' }}>{val}</Text>,
    },
    {
      title: 'Read Score',
      dataIndex: 'readScore',
      key: 'readScore',
      render: (val: number) => <Text style={{ color: '#595959' }}>{val}</Text>,
    },
    {
      title: 'Coding Score',
      dataIndex: 'codingScore',
      key: 'codingScore',
      render: (val: number) => <Text style={{ color: '#595959' }}>{val}</Text>,
    },
    {
      title: 'Essay Score',
      dataIndex: 'essayScore',
      key: 'essayScore',
      render: (val: number) => <Text style={{ color: '#595959' }}>{val}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'Approve') {
          return <Tag color="success" style={{ borderRadius: '12px', padding: '2px 12px', background: '#F6FFED', border: '1px solid #B7EB8F', color: '#52C41A' }}>Approve</Tag>;
        }
        return <Tag color="warning" style={{ borderRadius: '12px', padding: '2px 12px', background: '#FFFBE6', border: '1px solid #FFE58F', color: '#FAAD14' }}>Pending</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Button 
          type="primary" 
          onClick={() => router.push(`/student/report/${courseId}/${record.sublesson.id}`)}
          style={{ backgroundColor: '#531DAB', borderRadius: '8px', border: 'none' }}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Header */}
      <Card variant="borderless" style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '32px' }} styles={{ body: { padding: '18PX' } }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              Report Course: <span style={{ color: '#531DAB' }}>{data.course?.course_name || 'Course'}</span>
            </Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push(`/student/level/${courseId}`)}
              style={{ backgroundColor: '#1677FF', borderRadius: '8px', border: 'none', fontWeight: 500 }}
            >
              Kembali
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 4 Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {/* Card 1: Current Badge */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>Current Badge</Text>
              <div style={{ backgroundColor: '#FFFBE6', padding: '4px 8px', borderRadius: '6px' }}>
                <StarFilled style={{ color: '#FAAD14' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src={data.badge?.img_badge ? `/assets/gamification/${data.badge.img_badge}` : "https://api.dicebear.com/7.x/shapes/svg?seed=badge"} 
                alt="Badge" 
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                onError={(e: any) => { e.target.src = "https://api.dicebear.com/7.x/shapes/svg?seed=badge"; }}
              />
              <Title level={4} style={{ margin: 0 }}>{data.badge?.badge_name || 'Beginner'}</Title>
            </div>
          </Card>
        </Col>

        {/* Card 2: Total Score */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>Total Score</Text>
              <div style={{ backgroundColor: '#F6FFED', padding: '4px 8px', borderRadius: '6px' }}>
                <WalletFilled style={{ color: '#52C41A' }} />
              </div>
            </div>
            <Title level={2} style={{ margin: 0, fontWeight: 800 }}>{data.studentCourse?.total_score || 0}</Title>
          </Card>
        </Col>

        {/* Card 3: Progress */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>Progress</Text>
              <div style={{ backgroundColor: '#E6F4FF', padding: '4px 8px', borderRadius: '6px' }}>
                <ClockCircleFilled style={{ color: '#1677FF' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Progress percent={data.progressPercent} showInfo={false} strokeColor="#13C2C2" style={{ flex: 1 }} />
              <Text style={{ fontWeight: 600 }}>{data.progressPercent}%</Text>
            </div>
          </Card>
        </Col>

        {/* Card 4: Finished Test */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>Finished Test</Text>
              <div style={{ backgroundColor: '#FFF0F6', padding: '4px 8px', borderRadius: '6px' }}>
                <FolderFilled style={{ color: '#EB2F96' }} />
              </div>
            </div>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              {data.finishedTests} <span style={{ color: '#BFBFBF', fontSize: '20px', fontWeight: 500 }}>/ {data.totalTests}</span>
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card variant="borderless" style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} styles={{ body: { padding: 0 } }}>
        <style>{`
          .custom-table .ant-table-thead > tr > th {
            background-color: #F3E8FF !important;
            color: #262626 !important;
            font-weight: 600 !important;
          }
        `}</style>
        <Table 
          className="custom-table"
          columns={columns} 
          dataSource={data.reportData} 
          rowKey={(record: any) => record.sublesson.id}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          style={{ width: '100%' }}
        />
      </Card>
    </div>
  );
}
