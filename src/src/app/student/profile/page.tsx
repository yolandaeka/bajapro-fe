"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Avatar, Spin, Divider, Tag } from "antd";
import { UserOutlined, MailOutlined, BankOutlined, BookOutlined, TrophyOutlined, FireOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { getStudentProfileApi } from "../api/studentApi";

const { Title, Text } = Typography;

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

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

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getStudentProfileApi(studentId);
        setData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  if (!data) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        {/* Profile Card Area */}
        <Card 
            variant="borderless" 
            style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '24px' }}
            styles={{ body: { padding: '32px 48px' } }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <Avatar 
                    size={100} 
                    style={{ backgroundColor: '#FAAD14', color: '#fff', fontSize: '40px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                    {(() => {
                        const parts = data.user.name.trim().split(" ");
                        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    })()}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Title level={2} style={{ margin: 0, color: '#1F2937', fontWeight: 800 }}>{data.user.name}</Title>
                    <Text style={{ fontSize: '15px', color: '#6B7280', fontWeight: 500 }}>
                        Student {data.classData ? `• ${data.classData.class_name}` : ''}
                    </Text>
                </div>
            </div>
        </Card>

        <Row gutter={[24, 24]}>
            {/* Personal Information */}
            <Col xs={24} md={8}>
                <Card 
                    variant="borderless" 
                    style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%' }}
                    styles={{ body: { padding: '32px 24px' } }}
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#1F2937' }}>Informasi Pribadi</Title>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: '#E6F4FF', padding: '10px', borderRadius: '12px', color: '#1677FF' }}><UserOutlined style={{ fontSize: '18px' }} /></div>
                            <div>
                                <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>Nama Lengkap</Text>
                                <Text style={{ fontWeight: 600, color: '#1F2937', fontSize: '15px' }}>{data.user.name}</Text>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: '#F6FFED', padding: '10px', borderRadius: '12px', color: '#52C41A' }}><MailOutlined style={{ fontSize: '18px' }} /></div>
                            <div>
                                <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>Email</Text>
                                <Text style={{ fontWeight: 600, color: '#1F2937', fontSize: '15px' }}>{data.user.email}</Text>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: '#FFF0F6', padding: '10px', borderRadius: '12px', color: '#EB2F96' }}><BankOutlined style={{ fontSize: '18px' }} /></div>
                            <div>
                                <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>Instansi / Sekolah</Text>
                                <Text style={{ fontWeight: 600, color: '#1F2937', fontSize: '15px' }}>{data.user.instansi_sekolah || '-'}</Text>
                            </div>
                        </div>

                        <Divider style={{ margin: '12px 0' }} />
                        
                        <div>
                            <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Status Kelas</Text>
                            {data.classData ? (
                                <Tag color="blue" style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>{data.classData.class_name}</Tag>
                            ) : (
                                <Tag color="default" style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '13px' }}>Belum memiliki kelas</Tag>
                            )}
                        </div>
                    </div>
                </Card>
            </Col>

            {/* Learning Statistics */}
            <Col xs={24} md={16}>
                <Card 
                    variant="borderless" 
                    style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%' }}
                    styles={{ body: { padding: '32px' } }}
                >
                    <Title level={4} style={{ marginBottom: '32px', color: '#1F2937' }}>Statistik Pembelajaran</Title>

                    <Row gutter={[16, 24]} align="stretch">
                        <Col xs={24} sm={8} style={{ display: 'flex' }}>
                            <div style={{ flex: 1, background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', padding: '24px', borderRadius: '16px', textAlign: 'center', border: 'none', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ background: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px', color: '#4F46E5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    <BookOutlined style={{ fontSize: '24px' }} />
                                </div>
                                <Title level={2} style={{ margin: 0, color: '#312E81' }}>{data.stats.totalCourses}</Title>
                                <Text style={{ fontWeight: 600, color: '#4F46E5' }}>Enrolled Courses</Text>
                            </div>
                        </Col>
                        
                        <Col xs={24} sm={8} style={{ display: 'flex' }}>
                            <div style={{ flex: 1, background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', padding: '24px', borderRadius: '16px', textAlign: 'center', border: 'none', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ background: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px', color: '#D97706', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    <FireOutlined style={{ fontSize: '24px' }} />
                                </div>
                                <Title level={2} style={{ margin: 0, color: '#78350F' }}>{data.stats.totalScore}</Title>
                                <Text style={{ fontWeight: 600, color: '#D97706' }}>Total Score</Text>
                            </div>
                        </Col>

                        <Col xs={24} sm={8} style={{ display: 'flex' }}>
                            <div style={{ flex: 1, background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', padding: '24px', borderRadius: '16px', textAlign: 'center', border: 'none', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ background: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px', color: '#059669', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    <TrophyOutlined style={{ fontSize: '24px' }} />
                                </div>
                                <Title level={2} style={{ margin: 0, color: '#064E3B' }}>{data.stats.completedLessons}</Title>
                                <Text style={{ fontWeight: 600, color: '#059669' }}>Completed Sublessons</Text>
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginTop: '40px' }}>
                        <Title level={5} style={{ marginBottom: '16px', color: '#374151' }}>Badges Obtained</Title>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {data.stats.badges.length > 0 ? (
                                data.stats.badges.map((badge: any) => (
                                    <div key={badge.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 16px', borderRadius: '50px', border: '1px solid #E2E8F0' }}>
                                        <img src={badge.image} alt={badge.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} onError={(e: any) => { e.target.src = "https://api.dicebear.com/7.x/shapes/svg?seed=badge"; }} />
                                        <Text style={{ fontWeight: 600, color: '#334155' }}>{badge.name}</Text>
                                    </div>
                                ))
                            ) : (
                                <Text type="secondary">Belum ada badge yang diperoleh.</Text>
                            )}
                        </div>
                    </div>

                </Card>
            </Col>
        </Row>
      </motion.div>
    </div>
  );
}
