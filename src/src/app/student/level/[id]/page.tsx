"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Button, Spin, message } from "antd";
import { UnlockOutlined, LockOutlined, BookOutlined, RightCircleFilled, ArrowLeftOutlined, EnvironmentFilled } from "@ant-design/icons";
import { getCourseDetailApi, checkEnrollmentApi, enrollCourseApi } from "../../api/studentApi";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";

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

export default function CourseLevelSelection() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [messageApi, contextHolder] = message.useMessage();
  
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [studentId, setStudentId] = useState<number>(5);

  useEffect(() => {
    const fetchData = async () => {
      let currentUserId = 5;
      const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1];
      if (userCookie) {
        try {
          const u = JSON.parse(decodeURIComponent(userCookie).replace(/^"|"$/g, ''));
          currentUserId = u.id;
        } catch(e){}
      } else {
        const lsUser = localStorage.getItem("user");
        if(lsUser) {
           try{
               const u = JSON.parse(lsUser);
               currentUserId = u.id;
           }catch(e){}
        }
      }
      setStudentId(currentUserId);

      try {
        const [courseData, enrolled] = await Promise.all([
          getCourseDetailApi(courseId),
          checkEnrollmentApi(currentUserId, courseId)
        ]);
        
        setCourse(courseData);
        setIsEnrolled(enrolled);
      } catch (e) {
        console.error(e);
        messageApi.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const handleStartLesson = async (levelId: number, isLocked: boolean) => {
    if (isLocked) {
        messageApi.warning("Level is still locked!");
        return;
    }

    if (!isEnrolled) {
        setEnrolling(true);
        try {
            await enrollCourseApi(studentId, courseId);
            setIsEnrolled(true);
            messageApi.success("Successfully enrolled!");
        } catch (e) {
            console.error(e);
            messageApi.error("Failed to enroll");
        } finally {
            setEnrolling(false);
        }
    } else {
        messageApi.success("Resuming lesson...");
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  if (!course) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Course not found</div>;
  }

  // Define some static properties for Easy, Medium, Hard to match UI
  const levelUI = [
      { color: "#52C41A", icon: <UnlockOutlined />, bg: "#E6FFFB", locked: false }, // Easy
      { color: "#8C8C8C", icon: <LockOutlined />, bg: "#F5F5F5", locked: true },   // Medium
      { color: "#8C8C8C", icon: <LockOutlined />, bg: "#F5F5F5", locked: true }    // Hard
  ];

  return (
    <>
      {contextHolder}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible" 
        style={{ padding: '0 12px 24px' }}
      >
        <motion.div variants={itemVariants} style={{ marginBottom: "32px", maxWidth: "800px" }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push("/student/course")}
            style={{ marginBottom: "16px", padding: 0, color: "#8c8c8c", fontWeight: 600 }}
          >
            Kembali ke Daftar Course
          </Button>
          <Title level={3} style={{ fontWeight: 800, margin: "0 0 8px 0", fontSize: "24px" }}>
            <span style={{ color: "#531DAB" }}>Start</span> Your Adventure <span style={{ color: "#FAAD14" }}>Now!</span>
          </Title>
          <Paragraph type="secondary" style={{ fontSize: "14px", color: "#8c8c8c", marginBottom: 0 }}>
            Levels serve as milestones that learners can progress through, providing structure, motivation, and rewards.
          </Paragraph>
        </motion.div>

        <div style={{ position: "relative", padding: "20px 0" }}>
          {/* Map line connector (pseudo-element style) */}
          <div style={{ 
            position: "absolute", 
            left: "50%", 
            top: 0, 
            bottom: 0, 
            width: "4px", 
            backgroundColor: "#f0f0f0", 
            transform: "translateX(-50%)",
            borderRadius: "4px",
            zIndex: 0 
          }} className="map-connector" />

          <Row gutter={[24, 48]} style={{ position: "relative", zIndex: 1 }}>
          {course.levels.map((level: any, index: number) => {
            const ui = levelUI[index] || levelUI[2]; // fallback to locked if more than 3
            const isLeft = index % 2 === 0;
            
            return (
              <Col xs={24} md={24} key={level.id}>
                <motion.div 
                  variants={itemVariants} 
                  whileHover={{ y: -8 }} 
                  transition={{ type: "spring", stiffness: 300 }} 
                  style={{ 
                    display: "flex", 
                    justifyContent: isLeft ? "flex-start" : "flex-end",
                    position: "relative"
                  }}
                >
                  {/* Waypoint Marker on the path */}
                  <div className="waypoint-marker" style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "36px",
                      height: "36px",
                      backgroundColor: ui.locked ? "#f5f5f5" : "#fff",
                      border: `4px solid ${ui.locked ? "#d9d9d9" : "#531DAB"}`,
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 2,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}>
                      {ui.locked ? <LockOutlined style={{ color: "#bfbfbf", fontSize: "16px" }} /> : <EnvironmentFilled style={{ color: "#531DAB", fontSize: "18px" }} />}
                  </div>

                  <Card 
                    variant="borderless"
                    style={{ 
                        borderRadius: "20px", 
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)", 
                        width: "calc(50% - 40px)",
                        border: ui.locked ? "1px solid #f0f0f0" : "1px solid #e6d8f8",
                        background: ui.locked ? "#fafafa" : "#ffffff",
                    }}
                    styles={{ body: { padding: "24px", display: "flex", flexDirection: "column" } }}
                    className="level-card"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                        <div style={{ 
                            width: "48px", 
                            height: "48px", 
                            backgroundColor: ui.bg, 
                            borderRadius: "12px", 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center",
                            fontSize: "20px",
                            color: ui.color
                        }}>
                          {ui.icon}
                        </div>
                        <Title level={4} style={{ margin: 0, fontSize: "20px", color: ui.locked ? "#8c8c8c" : "#262626" }}>{level.level_name}</Title>
                    </div>
                    
                    <Paragraph type="secondary" style={{ display: "block", margin: "0 0 20px 0", minHeight: "44px", fontSize: "14px" }} ellipsis={{ rows: 2 }}>
                      {level.description}
                    </Paragraph>
                    
                    <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: ui.locked ? "#bfbfbf" : "#531DAB" }}>
                        <BookOutlined /> <Text style={{ color: ui.locked ? "#bfbfbf" : "#595959", fontWeight: 600, fontSize: "13px" }}>{level.lessonCount} Bab</Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: ui.locked ? "#bfbfbf" : "#531DAB" }}>
                        <BookOutlined /> <Text style={{ color: ui.locked ? "#bfbfbf" : "#595959", fontWeight: 600, fontSize: "13px" }}>{level.subLessonCount} Sub Bab</Text>
                      </div>
                    </div>

                    <div style={{ marginTop: "auto" }}>
                      <motion.div whileHover={!ui.locked ? { scale: 1.02 } : {}} whileTap={!ui.locked ? { scale: 0.98 } : {}}>
                        <Button 
                          type="primary" 
                          block 
                          size="large"
                          icon={!ui.locked && <RightCircleFilled />}
                          loading={!ui.locked && enrolling}
                          onClick={() => handleStartLesson(level.id, ui.locked)}
                          style={{ 
                              backgroundColor: ui.locked ? "#f5f5f5" : "#531DAB", 
                              borderColor: ui.locked ? "#d9d9d9" : "#531DAB", 
                              color: ui.locked ? "#bfbfbf" : "#fff",
                              borderRadius: "8px", 
                              fontWeight: 600,
                              fontSize: "14px"
                          }}
                        >
                          {ui.locked ? "Locked" : "Start Adventure"}
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
        </div>
      </motion.div>
      <style>{`
        @media (max-width: 768px) {
          .map-connector {
             left: 20px !important;
             transform: none !important;
          }
          .waypoint-marker {
             left: 20px !important;
             transform: translate(-50%, -50%) !important;
          }
          .level-card {
             width: calc(100% - 50px) !important;
             margin-left: 50px !important;
          }
        }
      `}</style>
    </>
  );
}
