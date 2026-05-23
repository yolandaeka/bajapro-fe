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
        } catch (e) { }
      } else {
        const lsUser = localStorage.getItem("user");
        if (lsUser) {
          try {
            const u = JSON.parse(lsUser);
            currentUserId = u.id;
          } catch (e) { }
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
        router.push(`/student/material/${courseId}/${levelId}`);
      } catch (e) {
        console.error(e);
        messageApi.error("Failed to enroll");
      } finally {
        setEnrolling(false);
      }
    } else {
      messageApi.success("Resuming lesson...");
      router.push(`/student/material/${courseId}/${levelId}`);
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
        <motion.div variants={itemVariants} style={{ marginBottom: "32px", textAlign: "center", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/student/course")}
              style={{ padding: 0, color: "#8c8c8c", fontWeight: 600 }}
            >
              Kembali ke Daftar Course
            </Button>
          </div>
          <Title level={3} style={{ fontWeight: 800, margin: "0 0 8px 0", fontSize: "24px" }}>
            <span style={{ color: "#531DAB" }}>Start</span> Your Adventure <span style={{ color: "#FAAD14" }}>Now!</span>
          </Title>
          <Paragraph type="secondary" style={{ fontSize: "14px", color: "#8c8c8c", marginBottom: 0, maxWidth: "600px", margin: "0 auto" }}>
            Levels serve as milestones that learners can progress through, providing structure, motivation, and rewards.
          </Paragraph>
        </motion.div>

        <div style={{ position: "relative", padding: "20px 0", display: "flex", justifyContent: "center", width: "100%" }}>
          <div style={{ 
            display: "flex", 
            gap: "64px", 
            overflowX: "auto", 
            padding: "10px 24px 40px 24px", // Extra bottom padding for hover effects
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            maxWidth: "100%",
          }} className="horizontal-scroll-container">
            
            {course.levels.map((level: any, index: number) => {
              const ui = levelUI[index] || levelUI[2]; // fallback to locked if more than 3

              return (
                <div key={level.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", minWidth: "280px", flex: 1, maxWidth: "340px" }} className="timeline-col">

                  {/* Horizontal Map Connector Line */}
                  {index < course.levels.length - 1 && (
                    <div style={{
                      position: "absolute",
                      top: "22px", // center of the 44px marker
                      left: "50%",
                      width: "calc(100% + 64px)", // span to the next column's center + gap
                      height: "4px",
                      backgroundColor: "#d6e4ff",
                      zIndex: 0,
                    }} />
                  )}

                  {/* Waypoint Marker on the path */}
                  <motion.div
                    animate={ui.locked ? {} : { y: [-4, 0, -4], scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="waypoint-marker" style={{
                      width: "44px",
                      height: "44px",
                      backgroundColor: ui.locked ? "#f5f5f5" : "#fff",
                      border: `4px solid ${ui.locked ? "#d9d9d9" : "#531DAB"}`,
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 2,
                      boxShadow: ui.locked ? "none" : "0 4px 12px rgba(83, 29, 171, 0.3)",
                      marginBottom: "24px"
                    }}>
                    {ui.locked ? <LockOutlined style={{ color: "#bfbfbf", fontSize: "16px" }} /> : <EnvironmentFilled style={{ color: "#531DAB", fontSize: "18px" }} />}
                  </motion.div>

                  <div className="card-wrapper" style={{ width: "100%", flexGrow: 1, display: "flex" }}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -6 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{ width: "100%", display: "flex" }}
                      className="level-card-container"
                    >
                      <Card
                        variant="borderless"
                        style={{
                          borderRadius: "20px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.06)", // A bit more shadow since no gradient background
                          width: "100%",
                          border: ui.locked ? "1px solid #f0f0f0" : "1px solid #e6d8f8",
                          background: ui.locked ? "#fafafa" : "#ffffff",
                          display: "flex",
                          flexDirection: "column"
                        }}
                        styles={{ body: { padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 } }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                          <div style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: ui.bg,
                            borderRadius: "14px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "20px",
                            color: ui.color,
                            flexShrink: 0
                          }}>
                            {ui.icon}
                          </div>
                          <Title level={4} style={{ margin: 0, fontSize: "18px", color: ui.locked ? "#8c8c8c" : "#262626" }}>{level.level_name}</Title>
                        </div>

                        <Paragraph type="secondary" style={{ margin: "0 0 20px 0", fontSize: "14px", lineHeight: "1.5", flexGrow: 1 }} ellipsis={{ rows: 3 }}>
                          {level.description}
                        </Paragraph>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <BookOutlined style={{ color: ui.locked ? "#bfbfbf" : "#531DAB" }} /> 
                            <Text style={{ color: ui.locked ? "#bfbfbf" : "#595959", fontWeight: 600, fontSize: "13px" }}>{level.lessonCount} Bab</Text>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <BookOutlined style={{ color: ui.locked ? "#bfbfbf" : "#531DAB" }} /> 
                            <Text style={{ color: ui.locked ? "#bfbfbf" : "#595959", fontWeight: 600, fontSize: "13px" }}>{level.subLessonCount} Sub Bab</Text>
                          </div>
                        </div>

                        <div style={{ marginTop: "auto" }}>
                          <motion.div whileHover={!ui.locked ? { scale: 1.05 } : {}} whileTap={!ui.locked ? { scale: 0.95 } : {}}>
                            <Button
                              type="primary"
                              block
                              size="large"
                              icon={!ui.locked && <RightCircleFilled />}
                              loading={!ui.locked && enrolling}
                              onClick={() => handleStartLesson(level.id, ui.locked)}
                              style={{
                                background: ui.locked ? "#f5f5f5" : "linear-gradient(135deg, #FFD700 0%, #FDB931 100%)",
                                borderColor: ui.locked ? "#d9d9d9" : "#FDB931",
                                color: ui.locked ? "#bfbfbf" : "#1F2937",
                                borderRadius: "10px",
                                fontWeight: 700,
                                height: "44px",
                                boxShadow: ui.locked ? "none" : "0 4px 12px rgba(253, 185, 49, 0.3)"
                              }}
                            >
                              {ui.locked ? "Locked" : "Start"}
                            </Button>
                          </motion.div>
                        </div>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
      <style>{`
        .horizontal-scroll-container::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 576px) {
          .timeline-col {
             min-width: 260px !important;
          }
        }
      `}</style>
    </>
  );
}
