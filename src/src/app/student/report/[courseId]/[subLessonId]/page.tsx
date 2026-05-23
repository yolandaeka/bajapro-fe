"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Button, Table, Tag, Spin, message, Tabs, Modal, Input } from "antd";
import { ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { getStudentSubLessonReportDetailApi } from "../../../api/studentApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function StudentReportDetail() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params?.courseId);
  const subLessonId = Number(params?.subLessonId);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Edit Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<any>(null);
  const [newAnswerText, setNewAnswerText] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    let studentId = 5;
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1];
    if (userCookie) {
      try {
        studentId = JSON.parse(decodeURIComponent(userCookie).replace(/^"|"$/g, '')).id;
      } catch (e) {}
    } else {
      const lsUser = localStorage.getItem("user");
      if (lsUser) {
        try {
          studentId = JSON.parse(lsUser).id;
        } catch (e) {}
      }
    }

    if (courseId && subLessonId) {
      fetchDetailData(studentId, courseId, subLessonId);
    }
  }, [courseId, subLessonId]);

  const fetchDetailData = async (studentId: number, cId: number, sId: number) => {
    try {
      setLoading(true);
      const res = await getStudentSubLessonReportDetailApi(studentId, cId, sId);
      setData(res);
    } catch (e) {
      console.error(e);
      message.error("Gagal memuat detail report.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record: any) => {
    setEditingAnswer(record);
    setNewAnswerText(record.answer?.answer || "");
    setIsModalVisible(true);
  };

  const handleUpdateAnswer = async () => {
    if (!editingAnswer || !editingAnswer.answer) return;
    
    try {
      setSubmitLoading(true);
      const response = await fetch(`${BASE_URL}/t_essay_answer/${editingAnswer.answer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            answer: newAnswerText,
            updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        message.success("Jawaban berhasil diubah!");
        setIsModalVisible(false);
        // Refresh data
        let studentId = 5;
        try { studentId = JSON.parse(localStorage.getItem("user") || "{}").id || 5; } catch (e) {}
        fetchDetailData(studentId, courseId, subLessonId);
      } else {
        message.error("Gagal mengubah jawaban.");
      }
    } catch (e) {
      console.error(e);
      message.error("Gagal mengubah jawaban.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  if (!data) return null;

  // Summary Table Columns
  const summaryColumns = [
    { title: 'Reading Score', dataIndex: 'readScore', key: 'readScore' },
    { title: 'Coding Score', dataIndex: 'codingScore', key: 'codingScore' },
    { title: 'Essay Score', dataIndex: 'essayScore', key: 'essayScore' },
    { title: 'Total Score', dataIndex: 'totalScore', key: 'totalScore', render: (val: number) => <Text style={{ color: '#531DAB', fontWeight: 700 }}>{val}</Text> },
  ];
  const summaryData = [{
    key: '1',
    readScore: data.readScore,
    codingScore: data.codingScore,
    essayScore: data.essayScore,
    totalScore: data.totalScore,
  }];

  // Code Report Table Columns
  const codeColumns = [
    { title: 'Jumlah Errors', dataIndex: 'errors', key: 'errors' },
    { title: 'Jumlah Success', dataIndex: 'success', key: 'success' },
    { title: 'Coding Score', dataIndex: 'score', key: 'score' },
  ];
  const errorLogs = data.codeLogs.filter((log: any) => log.is_error);
  const successLogs = data.codeLogs.filter((log: any) => !log.is_error);
  const codeData = [{
    key: '1',
    errors: errorLogs.length,
    success: successLogs.length,
    score: data.codingScore,
  }];

  // Essay Report Table Columns
  const essayColumns = [
    { 
      title: 'Question', 
      dataIndex: ['question', 'essay_question'], 
      key: 'question',
      render: (text: string) => <div dangerouslySetInnerHTML={{ __html: text }} />
    },
    { 
      title: 'Your Answer', 
      dataIndex: ['answer', 'answer'], 
      key: 'answer',
      render: (text: string) => text || '-'
    },
    { 
      title: 'Answer Key', 
      dataIndex: ['question', 'answer_key'], 
      key: 'answerKey',
      render: (text: string) => text || '-'
    },
    { 
      title: 'Notes', 
      dataIndex: ['answer', 'teacher_notes'], 
      key: 'notes',
      render: (text: string) => text || 'Tidak ada catatan'
    },
    { 
      title: 'Score', 
      dataIndex: 'score', 
      key: 'score',
      render: (val: number) => <Text style={{ color: '#531DAB', fontWeight: 700 }}>{val}</Text>
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => {
        // Logic: Can edit if user has a class AND answer is not approved
        const hasClass = data.user && data.user.class_id;
        const isApproved = record.answer?.is_approved_by_teacher;

        if (hasClass && !isApproved) {
            return (
                <Button 
                    type="primary" 
                    onClick={() => handleEditClick(record)}
                    style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14', color: '#fff', borderRadius: '6px' }}
                >
                    Edit
                </Button>
            );
        }
        return null;
      }
    }
  ];

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto'}}>
      {/* Header */}
      <Card variant="borderless" style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '24px' }} styles={{ body: { padding: '24px' } }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              Course: <span style={{ color: '#531DAB' }}>{data.course?.course_name}</span>
            </Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push(`/student/report/${courseId}`)}
              style={{ backgroundColor: '#1677FF', borderRadius: '8px', border: 'none', fontWeight: 500 }}
            >
              Kembali
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Container */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <style>{`
          .custom-table .ant-table-thead > tr > th {
            background-color: #F3E8FF !important;
            color: #262626 !important;
            font-weight: 600 !important;
          }
        `}</style>
        
        {/* Sub Lesson Header */}
        <div style={{ marginBottom: '24px' }}>
          <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Sub Lesson</Text>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#531DAB' }}>{data.sublesson?.title}</Title>
            {data.status === 'Approve' ? (
               <Tag color="success" style={{ borderRadius: '12px', padding: '4px 16px', border: '1px solid #B7EB8F', color: '#52C41A', fontSize: '14px' }}>Approve</Tag>
            ) : (
               <Tag color="warning" style={{ borderRadius: '12px', padding: '4px 16px', border: '1px solid #FFE58F', color: '#FAAD14', fontSize: '14px' }}>Pending</Tag>
            )}
          </div>
        </div>

        {/* Summary Table */}
        <div style={{ marginBottom: '32px' }}>
          <Text style={{ display: 'block', marginBottom: '12px', color: '#595959' }}>Summary Penilaian</Text>
          <Table 
            className="custom-table"
            columns={summaryColumns} 
            dataSource={summaryData} 
            pagination={false} 
            bordered 
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          />
        </div>

        {/* Soal Studi Kasus */}
        {data.codeQuestion && (
            <div style={{ marginBottom: '32px' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Soal</Text>
            <Title level={4} style={{ color: '#531DAB', marginBottom: '16px' }}>Studi Kasus</Title>
            <div 
                style={{ fontSize: '14px', lineHeight: '1.6', color: '#595959', marginBottom: '24px' }}
                dangerouslySetInnerHTML={{ __html: data.codeQuestion?.code_question }} 
            />
            
            {/* If there's a code snippet in the question hint or answer, show it */}
            {(data.codeAnswer?.answer || data.codeQuestion?.hint) && (
                <div style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#111827', fontSize: '13px' }}>
                    {data.codeAnswer?.answer || data.codeQuestion?.hint}
                </div>
            )}
            </div>
        )}

        {/* Tabs for Details */}
        <Tabs 
            defaultActiveKey="1"
            items={[
                {
                    key: '1',
                    label: 'Code Test Report',
                    children: (
                        <div style={{ paddingTop: '16px' }}>
                            <Title level={4} style={{ color: '#531DAB', marginBottom: '24px' }}>Detail</Title>
                            
                            <Text style={{ display: 'block', marginBottom: '12px', color: '#595959' }}>Penilaian</Text>
                            <Table 
                                className="custom-table"
                                columns={codeColumns} 
                                dataSource={codeData} 
                                pagination={false} 
                                bordered 
                                style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '32px' }}
                            />

                            <Text style={{ display: 'block', marginBottom: '12px', color: '#595959' }}>Exercise Logs</Text>
                            <div style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '12px', padding: '24px' }}>
                                
                                {errorLogs.map((log: any) => (
                                    <div key={log.id} style={{ marginBottom: '24px' }}>
                                        <Tag color="error" style={{ borderRadius: '12px', padding: '2px 12px', marginBottom: '12px' }}>Error</Tag>
                                        <pre style={{ margin: 0, color: '#CF1322', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                            {log.message}
                                        </pre>
                                    </div>
                                ))}

                                {successLogs.map((log: any) => (
                                    <div key={log.id} style={{ marginBottom: '24px' }}>
                                        <Tag color="success" style={{ borderRadius: '12px', padding: '2px 12px', marginBottom: '12px' }}>Success</Tag>
                                        <pre style={{ margin: 0, color: '#389E0D', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                            {log.message}
                                        </pre>
                                    </div>
                                ))}

                                {data.codeLogs.length === 0 && <Text type="secondary">Tidak ada log untuk code ini.</Text>}

                            </div>
                        </div>
                    ),
                },
                {
                    key: '2',
                    label: 'Essay Test Report',
                    children: (
                        <div style={{ paddingTop: '16px' }}>
                            <Title level={4} style={{ color: '#531DAB', marginBottom: '24px' }}>Detail</Title>
                            <Text style={{ display: 'block', marginBottom: '12px', color: '#595959' }}>Penilaian</Text>
                            <Table 
                                className="custom-table"
                                columns={essayColumns} 
                                dataSource={data.essayDetails} 
                                pagination={false}
                                bordered
                                rowKey={(record: any) => record.question.id}
                            />
                        </div>
                    ),
                }
            ]}
        />
      </div>

      {/* Edit Essay Answer Modal */}
      <Modal
        title="Edit Jawaban Essay"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                Batal
            </Button>,
            <Button key="submit" type="primary" loading={submitLoading} onClick={handleUpdateAnswer} style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}>
                Simpan Perubahan
            </Button>
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Pertanyaan:</Text>
            <div dangerouslySetInnerHTML={{ __html: editingAnswer?.question?.essay_question || "" }} />
        </div>
        <div>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Jawaban Anda:</Text>
            <TextArea 
                rows={6} 
                value={newAnswerText} 
                onChange={(e) => setNewAnswerText(e.target.value)}
                placeholder="Ketik jawabanmu disini..."
            />
        </div>
      </Modal>

    </div>
  );
}
