"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Spin, Button, Empty, Modal, Avatar } from "antd";
import { PlayCircleOutlined, BookOutlined, ClockCircleOutlined, TrophyOutlined, RightOutlined, FireFilled, SafetyOutlined } from "@ant-design/icons";
import { getStudentDashboardApi } from "@/src/actions/student/studentApi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";

import { useSession } from "next-auth/react";

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

export default function DashboardManager() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<{name: string, id: number}>({ name: "Pelajar", id: 5 });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setUser({ name: u.name, id: u.id });
      
      const fetchUserAndData = async () => {
        try {
          const res = await getStudentDashboardApi(u.id);
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
    }
  }, [session]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  // Formatting for number commas
  const formatScore = (num: number) => {
    if (!num) return "0";
    return num.toLocaleString("id-ID");
  };

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
              style={{ backgroundColor: "#5B21B6", borderRadius: "8px", fontWeight: 600, border: "none" }}
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
      style={{ maxWidth: "1200px", margin: "0 auto" }}
    >
      {/* Title / Greeting */}
      <motion.div variants={itemVariants} style={{ marginBottom: "28px" }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: "28px", color: "#1F2937" }}>
          Selamat Datang, {user?.name ? user.name.split(" ")[0] : "Pelajar"}! <span className="wave-animation" role="img" aria-label="wave" style={{ display: "inline-block" }}>👋</span>
        </Title>
        <Text style={{ color: "#6B7280", fontSize: "14px" }}>Lanjutkan belajar Anda dan raih target hari ini!</Text>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* Left Side: Stats and History */}
        <Col xs={24} lg={16}>
          {/* Stats Row */}
          <motion.div variants={itemVariants} style={{ marginBottom: "28px" }}>
            <Row gutter={[16, 16]}>
              {/* Enrolled Course */}
              <Col xs={24} sm={8}>
                <Card 
                  variant="borderless" 
                  style={{ 
                    borderRadius: "16px", 
                    backgroundColor: "#EDE9FE", 
                    boxShadow: "0 4px 12px rgba(91, 33, 182, 0.03)", 
                    height: '100%' 
                  }} 
                  styles={{ body: { padding: "20px" } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "16px" }}>
                    <Text style={{ fontSize: "13px", fontWeight: 700, color: "#5B21B6" }}>Enrolled Course</Text>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "8px", borderRadius: "10px", color: "#5B21B6", display: 'flex' }}>
                      <BookOutlined style={{ fontSize: "16px" }} />
                    </div>
                  </div>
                  <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#5B21B6" }}>
                    {data?.enrolledCount || 0} <span style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280" }}>active</span>
                  </Title>
                </Card>
              </Col>

              {/* Materials Done */}
              <Col xs={24} sm={8}>
                <Card 
                  variant="borderless" 
                  style={{ 
                    borderRadius: "16px", 
                    backgroundColor: "#D1FAE5", 
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.03)", 
                    height: '100%' 
                  }} 
                  styles={{ body: { padding: "20px" } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "16px" }}>
                    <Text style={{ fontSize: "13px", fontWeight: 700, color: "#065F46" }}>Materials Done</Text>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "8px", borderRadius: "10px", color: "#10B981", display: 'flex' }}>
                      <FireFilled style={{ fontSize: "16px" }} />
                    </div>
                  </div>
                  <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#065F46" }}>
                    {data?.materialsCompleted || 0} <span style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280" }}>/ {data?.materialsTotal || 0}</span>
                  </Title>
                </Card>
              </Col>

              {/* Overall Progress */}
              <Col xs={24} sm={8}>
                <Card 
                  variant="borderless" 
                  style={{ 
                    borderRadius: "16px", 
                    backgroundColor: "#E0F2FE", 
                    boxShadow: "0 4px 12px rgba(3, 105, 161, 0.03)", 
                    height: '100%' 
                  }} 
                  styles={{ body: { padding: "20px" } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "16px" }}>
                    <Text style={{ fontSize: "13px", fontWeight: 700, color: "#0369A1" }}>Overall Progress</Text>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "8px", borderRadius: "10px", color: "#0284C7", display: 'flex' }}>
                      <ClockCircleOutlined style={{ fontSize: "16px" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <Progress 
                      percent={data?.overallProgress || 0} 
                      strokeColor="#0284C7" 
                      railColor="#E5E7EB" 
                      showInfo={false} 
                      style={{ margin: 0, flex: 1 }} 
                    />
                    <Text style={{ fontSize: "14px", fontWeight: 800, color: "#0369A1" }}>
                      {data?.overallProgress || 0}%
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </motion.div>

          {/* Lesson History Section */}
          <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', marginBottom: "16px", gap: "8px" }}>
            <PlayCircleOutlined style={{ color: "#5B21B6", fontSize: "18px" }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: "#1F2937" }}>Lesson History</Title>
          </motion.div>
          
          <motion.div variants={containerVariants}>
            {data?.lessonHistory?.length > 0 ? (
                data.lessonHistory.map((history: any) => {
                  const progressPct = history.total_score > 100 ? 100 : history.total_score || 0;
                  return (
                    <motion.div variants={itemVariants} key={history.id} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400 }}>
                      <Card 
                        variant="borderless" 
                        style={{ 
                          borderRadius: "16px", 
                          marginBottom: "16px", 
                          boxShadow: "0 4px 16px rgba(0,0,0,0.02)", 
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#FFFFFF"
                        }} 
                        styles={{ body: { padding: "20px" } }}
                      >
                        <Row gutter={24} align="middle">
                          <Col xs={24} sm={6}>
                            {history.course?.img_thumbnail ? (
                              <div style={{ 
                                 width: '100%', 
                                 height: '110px', 
                                 borderRadius: '12px', 
                                 background: `url(/assets/courses/${history.course.img_thumbnail}) center/cover no-repeat`,
                                 backgroundColor: '#F3F4F6' 
                              }} />
                            ) : (
                              <div style={{ 
                                width: '100%', 
                                height: '110px', 
                                background: 'linear-gradient(135deg, #FFB75E 0%, #FF6B8B 100%)', 
                                borderRadius: '12px' 
                              }} />
                            )}
                          </Col>
                          <Col xs={24} sm={18}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                              <div style={{ flex: 1, minWidth: "200px" }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                  <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                                    Intermediate
                                  </span>
                                </div>
                                <Title level={4} style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 700, color: "#1F2937" }}>
                                  {history.course?.course_name || "Java Programming"}
                                </Title>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", maxWidth: "300px", marginTop: "12px" }}>
                                  <Progress 
                                    percent={progressPct} 
                                    strokeColor="#5B21B6" 
                                    railColor="#E5E7EB" 
                                    showInfo={false} 
                                    size="small" 
                                    style={{ margin: 0, flex: 1 }} 
                                  />
                                  <Text style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280" }}>
                                    {progressPct}% Progress
                                  </Text>
                                </div>
                              </div>
                              
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <Button 
                                  type="primary" 
                                  size="large"
                                  style={{
                                    backgroundColor: "#5B21B6", 
                                    borderRadius: "8px", 
                                    fontWeight: 600, 
                                    border: "none",
                                    padding: "0 24px",
                                    height: "40px"
                                  }}
                                  onClick={() => router.push(`/student/level/${history.course_id}`)}
                                >
                                  Lanjutkan
                                </Button>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </motion.div>
                  );
                })
            ) : (
                <Empty description="No lesson history" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </motion.div>
        </Col>

        {/* Right Side: Achievement and Leaderboard */}
        <Col xs={24} lg={8}>
          {/* Achievement Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }} style={{ marginBottom: "24px" }}>
            <Card 
              variant="borderless" 
              style={{ 
                borderRadius: "16px", 
                background: "linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)", 
                color: "#fff",
                boxShadow: "0 8px 24px rgba(245, 158, 11, 0.25)",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "50%", display: "flex" }}>
                    <TrophyOutlined style={{ fontSize: "24px", color: "#FFE58F" }} />
                  </div>
                </motion.div>
                <div>
                  <Text style={{ fontWeight: 800, fontSize: "16px", color: "#fff", display: "block" }}>Achievement</Text>
                  <Text style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)" }}>Kamu luar biasa! Pertahankan.</Text>
                </div>
              </div>

              {/* Badge Display */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.1)", padding: "14px 18px", borderRadius: "14px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div>
                  <Text style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", display: "block", textTransform: "uppercase" }}>Badge</Text>
                  <Text style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>
                    {data?.achievement?.badge || "Warrior"}
                  </Text>
                </div>
                {/* Simulated Badge Icon */}
                <div style={{ width: "42px", height: "42px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FFE58F" }}>
                  <SafetyOutlined style={{ fontSize: "20px", color: "#FFE58F" }} />
                </div>
              </div>

              <Row gutter={12}>
                <Col span={12}>
                  <div style={{ background: "rgba(255,255,255,0.15)", padding: "10px 4px", borderRadius: "12px", textAlign: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px", display: 'block', marginBottom: '2px', textTransform: "uppercase", letterSpacing: "0.5px" }}>Rank</Text>
                    <Text style={{ color: "#fff", fontWeight: 800, fontSize: "15px" }}>
                      {data?.achievement?.rank || "10"}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: "rgba(255,255,255,0.15)", padding: "10px 4px", borderRadius: "12px", textAlign: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px", display: 'block', marginBottom: '2px', textTransform: "uppercase", letterSpacing: "0.5px" }}>Score</Text>
                    <Text style={{ color: "#fff", fontWeight: 800, fontSize: "15px" }}>
                      {formatScore(data?.achievement?.totalScore || 14250)}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </motion.div>

          {/* Leaderboard Card */}
          <motion.div variants={itemVariants}>
            <Card 
              variant="borderless" 
              style={{ borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E5E7EB" }}
              styles={{ body: { padding: "20px" } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: "18px" }}>
                <TrophyOutlined style={{ color: "#F59E0B", fontSize: "18px" }} />
                <Title level={5} style={{ margin: 0, fontWeight: 700, color: "#1F2937" }}>Leaderboard</Title>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data?.top5Leaderboard && data.top5Leaderboard.length > 0 ? (
                  data.top5Leaderboard.slice(0, 3).map((item: any, index: number) => {
                    const getInitials = (name: string) => {
                      if (!name) return "";
                      const parts = name.trim().split(" ");
                      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    };
                    const isMe = item.id === user.id;
                    const trophyColors = ["#F59E0B", "#9CA3AF", "#D97706"];
                    return (
                      <div 
                        key={item.id} 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between", 
                          padding: "8px 12px",
                          borderRadius: '12px',
                          border: isMe ? '1px solid #5B21B630' : '1px solid #F3F4F6',
                          backgroundColor: isMe ? '#EDE9FE40' : '#FFFFFF',
                          transition: 'all 0.3s' 
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "22px", fontWeight: 800, color: trophyColors[index] || "#6B7280" }}>
                            {index + 1}
                          </div>
                          <Avatar size="default" style={{ backgroundColor: isMe ? '#5B21B6' : '#F59E0B', color: '#fff', fontWeight: 'bold' }}>
                            {getInitials(item.name)}
                          </Avatar>
                          <div>
                            <Text style={{ fontWeight: 700, fontSize: "13px", display: "block", color: "#1F2937" }}>
                              {item.name}
                            </Text>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, color: "#5B21B6", fontSize: "14px" }}>
                          {formatScore(item.score)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Empty description="Belum ada data leaderboard" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>

              {/* View Leaderboard Link */}
              <div style={{ textAlign: "center", marginTop: "18px", borderTop: "1px solid #F3F4F6", paddingTop: "14px" }}>
                <Button 
                  type="link" 
                  onClick={() => router.push("/student/leaderboard")} 
                  style={{ color: "#5B21B6", fontWeight: 700, fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  See Leaderboard <RightOutlined style={{ fontSize: "10px" }} />
                </Button>
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

