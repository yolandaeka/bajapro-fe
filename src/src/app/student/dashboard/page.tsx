"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Spin, Button, Empty, Modal, Avatar } from "antd";
import { PlayCircleOutlined, BookOutlined, ClockCircleOutlined, TrophyOutlined, RightOutlined, FireFilled } from "@ant-design/icons";
import { getStudentDashboardApi } from "../api/studentApi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<{name: string, id: number}>({ name: "Pelajar", id: 5 });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const fetchUserAndData = async () => {
      let currentUserId = 5;
      let currentUserName = "Amanda";
      const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1];
      if (userCookie) {
        try {
          const u = JSON.parse(decodeURIComponent(userCookie).replace(/^"|"$/g, ''));
          currentUserId = u.id;
          currentUserName = u.name;
        } catch(e){}
      } else {
        const lsUser = localStorage.getItem("user");
        if(lsUser) {
           try{
               const u = JSON.parse(lsUser);
               currentUserId = u.id;
               currentUserName = u.name;
           }catch(e){}
        }
      }
      setUser({ name: currentUserName, id: currentUserId });

      try {
        const res = await getStudentDashboardApi(currentUserId);
        setData(res);
        if (res.enrolledCount === 0) {
            setShowWelcomeModal(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndData();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  return (
    <>
    <AnimatePresence>
      {showWelcomeModal && (
        <Modal
          open={showWelcomeModal}
          footer={null}
          closable={false}
          centered
          width={400}
          styles={{ body: { padding: "32px", textAlign: "center", borderRadius: "16px" } }}
        >
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🚀</div>
            <Title level={3} style={{ fontWeight: 800 }}>Mulai Petualanganmu!</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: "24px" }}>
              Kamu belum mendaftar di kelas manapun. Yuk, temukan kursus yang menarik dan mulai belajar sekarang!
            </Text>
            <Button 
              type="primary" 
              size="large" 
              block 
              style={{ backgroundColor: "#531DAB", borderRadius: "8px", fontWeight: 600 }}
              onClick={() => {
                setShowWelcomeModal(false);
                router.push("/student/course");
              }}
            >
              Browse Course
            </Button>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>

    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      style={{ padding: '0 12px 24px' }}
    >
      <motion.div variants={itemVariants}>
        <Row justify="space-between" align="middle" style={{ marginBottom: "24px", gap: "16px" }}>
          <Col xs={24} sm={16}>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
              Selamat Datang, {user?.name ? user.name.split(" ")[0] : "Pelajar"}! <span className="wave-animation" role="img" aria-label="wave" style={{ display: "inline-block" }}>👋</span>
            </Title>
            <Text style={{ color: "#8c8c8c", fontSize: "14px" }}>Lanjutkan belajar Anda dan raih target hari ini!</Text>
          </Col>
        </Row>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* Kiri */}
        <Col xs={24} lg={16}>
          {/* Stats Row */}
          <motion.div variants={itemVariants} style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 16]} align="stretch">
              <Col xs={24} sm={8} style={{ display: 'flex' }}>
                <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} style={{ width: '100%' }}>
                  <Card variant="borderless" style={{ width: '100%', borderRadius: "16px", background: "linear-gradient(145deg, #ffffff, #f0f5ff)", boxShadow: "0 4px 12px rgba(47, 84, 235, 0.05)", height: '100%' }} styles={{ body: { padding: "20px", display: 'flex', flexDirection: 'column', height: '100%' } }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "16px" }}>
                        <Text type="secondary" style={{ fontSize: "13px", fontWeight: 600, color: "#595959" }}>Enrolled Course</Text>
                        <div style={{ backgroundColor: "#D6E4FF", padding: "8px", borderRadius: "10px", color: "#2F54EB", display: 'flex' }}>
                            <BookOutlined />
                        </div>
                    </div>
                    <Title level={3} style={{ margin: "auto 0 0", fontWeight: 800, color: "#1D39C4" }}>
                      {data?.enrolledCount || 0} <span style={{ fontSize: "12px", fontWeight: 500, color: "#8c8c8c" }}>active</span>
                    </Title>
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={8} style={{ display: 'flex' }}>
                <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} style={{ width: '100%' }}>
                  <Card variant="borderless" style={{ width: '100%', borderRadius: "16px", background: "linear-gradient(145deg, #ffffff, #fff0f6)", boxShadow: "0 4px 12px rgba(235, 47, 150, 0.05)", height: '100%' }} styles={{ body: { padding: "20px", display: 'flex', flexDirection: 'column', height: '100%' } }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "16px" }}>
                        <Text type="secondary" style={{ fontSize: "13px", fontWeight: 600, color: "#595959" }}>Materials Done</Text>
                        <div style={{ backgroundColor: "#FFD8BF", padding: "8px", borderRadius: "10px", color: "#FA541C", display: 'flex' }}>
                            <FireFilled />
                        </div>
                    </div>
                    <Title level={3} style={{ margin: "auto 0 0", fontWeight: 800, color: "#C41D7F" }}>
                      {data?.materialsCompleted || 0} <span style={{ fontSize: "13px", fontWeight: 500, color: "#8c8c8c" }}>/ {data?.materialsTotal || 0}</span>
                    </Title>
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={8} style={{ display: 'flex' }}>
                <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} style={{ width: '100%' }}>
                  <Card variant="borderless" style={{ width: '100%', borderRadius: "16px", background: "linear-gradient(145deg, #ffffff, #e6fffb)", boxShadow: "0 4px 12px rgba(19, 194, 194, 0.05)", height: '100%' }} styles={{ body: { padding: "20px", display: 'flex', flexDirection: 'column', height: '100%' } }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "16px" }}>
                        <Text type="secondary" style={{ fontSize: "13px", fontWeight: 600, color: "#595959" }}>Overall Progress</Text>
                        <div style={{ backgroundColor: "#B5F5EC", padding: "8px", borderRadius: "10px", color: "#08979C", display: 'flex' }}>
                            <ClockCircleOutlined />
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <Progress percent={data?.overallProgress || 0} strokeColor="#13C2C2" railColor="#E6FFFB" style={{ margin: 0 }} />
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </motion.div>

          {/* Lesson History */}
          <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', marginBottom: "16px", gap: "8px" }}>
            <PlayCircleOutlined style={{ color: "#531DAB", fontSize: "18px" }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Lesson History</Title>
          </motion.div>
          
          <motion.div variants={containerVariants}>
            {data?.lessonHistory?.length > 0 ? (
                data.lessonHistory.map((history: any) => (
                    <motion.div variants={itemVariants} key={history.id} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400 }}>
                      <Card variant="borderless" style={{ borderRadius: "16px", marginBottom: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)", border: "1px solid #f0f0f0" }} styles={{ body: { padding: "20px" } }}>
                          <Row gutter={24} align="middle">
                              <Col xs={24} sm={8}>
                                  {history.course?.img_thumbnail ? (
                                     <div style={{ 
                                        width: '100%', 
                                        height: '120px', 
                                        borderRadius: '12px', 
                                        background: `url(/assets/courses/${history.course.img_thumbnail}) center/cover no-repeat`,
                                        backgroundColor: '#f5f5f5' 
                                     }} />
                                  ) : (
                                     <div style={{ width: '100%', height: '120px', background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)', borderRadius: '12px' }} />
                                  )}
                              </Col>
                              <Col xs={24} sm={16} style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                                  <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                          <span style={{ background: '#FFF7E6', color: '#FAAD14', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>COURSE</span>
                                      </div>
                                      <Title level={4} style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#262626" }}>{history.course?.course_name}</Title>
                                      <Paragraph type="secondary" style={{ display: 'block', margin: '0 0 16px 0', fontSize: "13px", lineHeight: "1.5" }} ellipsis={{ rows: 2 }}>{history.course?.description}</Paragraph>
                                  </div>
                                  
                                  <div>
                                      <Progress percent={history.total_score > 100 ? 100 : history.total_score || 0} strokeColor="#531DAB" size="small" style={{ marginBottom: "16px" }} />
                                      <Button 
                                        type="primary" 
                                        onClick={() => router.push(`/student/level/${history.course_id}`)}
                                      >
                                          Lanjutkan Belajar
                                      </Button>
                                  </div>
                              </Col>
                          </Row>
                      </Card>
                    </motion.div>
                ))
            ) : (
                <Empty description="No lesson history" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </motion.div>
        </Col>

        {/* Kanan */}
        <Col xs={24} lg={8}>
          {/* Achievement */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }} style={{ marginBottom: "24px" }}>
            <Card 
              variant="borderless" 
              style={{ 
                  borderRadius: "16px", 
                  background: "linear-gradient(135deg, #FFB75E 0%, #FF6B8B 100%)", 
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(255, 107, 139, 0.3)",
              }}
              styles={{ body: { padding: "24px" } }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}>
                    <div style={{ background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "50%", display: "flex" }}>
                        <TrophyOutlined style={{ fontSize: "28px", color: "#FFE58F" }} />
                    </div>
                  </motion.div>
                  <div>
                    <Text style={{ fontWeight: 700, fontSize: "18px", color: "#fff", display: "block" }}>Achievement</Text>
                    <Text style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)" }}>Kamu luar biasa! Pertahankan.</Text>
                  </div>
                </div>
                <Row gutter={8}>
                    <Col span={8}>
                        <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px 4px", borderRadius: "12px", textAlign: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "10px", display: 'block', marginBottom: '2px', textTransform: "uppercase", letterSpacing: "0.5px" }}>Badge</Text>
                            <Text style={{ color: "#fff", fontWeight: 800, fontSize: "12px" }}>{data?.achievement?.badge || "-"}</Text>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px 4px", borderRadius: "12px", textAlign: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "10px", display: 'block', marginBottom: '2px', textTransform: "uppercase", letterSpacing: "0.5px" }}>Rank</Text>
                            <Text style={{ color: "#fff", fontWeight: 800, fontSize: "13px" }}>{data?.achievement?.rank || "-"}</Text>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px 4px", borderRadius: "12px", textAlign: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "10px", display: 'block', marginBottom: '2px', textTransform: "uppercase", letterSpacing: "0.5px" }}>Score</Text>
                            <Text style={{ color: "#fff", fontWeight: 800, fontSize: "13px" }}>{data?.achievement?.totalScore || "0"}</Text>
                        </div>
                    </Col>
                </Row>
            </Card>
          </motion.div>

          {/* Top 5 Leaderboard */}
          <motion.div variants={itemVariants}>
            <Card 
              variant="borderless" 
              style={{ borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
              styles={{ body: { padding: "16px" } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <TrophyOutlined style={{ color: "#FAAD14", fontSize: "18px" }} />
                <Title level={5} style={{ margin: 0, fontWeight: 700 }}>Top 5 Leaderboard</Title>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {data?.top5Leaderboard && data.top5Leaderboard.length > 0 ? (
                  data.top5Leaderboard.map((item: any, index: number) => {
                    const getInitials = (name: string) => {
                      if (!name) return "";
                      const parts = name.trim().split(" ");
                      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    };
                    const isMe = item.id === user.id;
                    return (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMe ? "8px" : "8px 0", borderBottom: index === 4 ? "none" : "1px solid #f0f0f0", backgroundColor: isMe ? '#F0F5FF' : 'transparent', borderRadius: isMe ? '8px' : '0', transition: 'all 0.3s' }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ position: "relative" }}>
                                <Avatar size="default" style={{ backgroundColor: isMe ? '#531DAB' : '#FAAD14', color: '#fff', fontWeight: 'bold' }}>{getInitials(item.name)}</Avatar>
                                {index < 3 && (
                                    <div style={{ 
                                        position: "absolute", top: -6, right: -6, 
                                        background: index === 0 ? "linear-gradient(135deg, #FFD700 0%, #FDB931 100%)" : index === 1 ? "linear-gradient(135deg, #E2E2E2 0%, #9F9F9F 100%)" : "linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)",
                                        color: "#fff", borderRadius: "50%", width: "16px", height: "16px", 
                                        display: "flex", justifyContent: "center", alignItems: "center", fontSize: "9px", fontWeight: "bold",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.15)", border: "1px solid #fff", zIndex: 2
                                    }}>
                                        {index + 1}
                                    </div>
                                )}
                            </div>
                            <div>
                                <Text style={{ fontWeight: 600, fontSize: "13px", display: "block", color: isMe ? '#531DAB' : '#1F2937', marginBottom: '-2px' }}>{item.name} {isMe && <span style={{ fontSize: '10px', background: '#D6E4FF', color: '#1D39C4', padding: '2px 6px', borderRadius: '6px', marginLeft: 4 }}>You</span>}</Text>
                                <Text type="secondary" style={{ fontSize: "11px" }}>Total Score</Text>
                            </div>
                        </div>
                        <div style={{ fontWeight: 800, color: "#531DAB", fontSize: "14px" }}>{item.score}</div>
                      </div>
                    );
                  })
                ) : (
                  <Empty description="Belum ada data leaderboard" />
                )}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
      <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .wave-animation {
          animation: wave 2.5s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </motion.div>
    </>
  );
}