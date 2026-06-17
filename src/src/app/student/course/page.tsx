"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Button, Spin, Empty } from "antd";
import { getAllCoursesApi, getStudentDashboardApi } from "../api/studentApi";
import { useRouter } from "next/navigation";
import { BookOutlined, PlayCircleOutlined, PieChartOutlined } from "@ant-design/icons";
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

export default function BrowseCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledMap, setEnrolledMap] = useState<Record<number, any>>({});

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

      try {
        const [allCourses, dashData] = await Promise.all([
          getAllCoursesApi(),
          getStudentDashboardApi(currentUserId)
        ]);
        
        const eMap: Record<number, any> = {};
        dashData.lessonHistory.forEach((h: any) => {
          eMap[h.course_id] = h;
        });

        setCourses(allCourses);
        setEnrolledMap(eMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      style={{ maxWidth: "1200px", margin: "0 auto" }}
    >
      <motion.div variants={itemVariants} style={{ marginBottom: "28px", maxWidth: "800px" }}>
        <Title level={2} style={{ fontWeight: 800, margin: "0 0 8px 0", fontSize: "28px", color: "#1F2937" }}>
          Take Your Lesson now!
        </Title>
        <Text style={{ fontSize: "14px", color: "#6B7280" }}>
          You can explore and discover various courses available for your learning journey. Browse through a wide range of subjects and topics, and choose the courses that align with your interests and goals.
        </Text>
      </motion.div>

      {courses.length > 0 ? (
        <Row gutter={[24, 24]}>
          {courses.map((course) => {
            const isEnrolled = enrolledMap[course.id];
            // Format progress percent
            const progressVal = isEnrolled ? (isEnrolled.total_score > 100 ? 100 : isEnrolled.total_score || 5) : 0;
            
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                <motion.div variants={itemVariants} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }} style={{ height: "100%" }}>
                  <Card 
                    variant="borderless"
                    style={{ 
                      borderRadius: "16px", 
                      overflow: "hidden", 
                      boxShadow: "0 4px 16px rgba(0,0,0,0.03)", 
                      display: "flex", 
                      flexDirection: "column", 
                      height: "100%",
                      border: "1px solid #E5E7EB",
                      backgroundColor: "#FFFFFF"
                    }}
                    styles={{ body: { padding: "20px", display: "flex", flexDirection: "column", flex: 1 } }}
                  >
                    {/* Course Thumbnail */}
                    {course.img_thumbnail ? (
                      <div style={{ 
                         width: '100%', 
                         height: '140px', 
                         borderRadius: '12px', 
                         background: `url(/assets/courses/${course.img_thumbnail}) center/cover no-repeat`,
                         backgroundColor: '#F3F4F6',
                         marginBottom: "16px"
                      }} />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '140px', 
                        background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', 
                        borderRadius: '12px',
                        marginBottom: "16px"
                      }} />
                    )}
                    
                    <Title level={4} style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700, color: "#1F2937" }}>
                      {course.course_name}
                    </Title>
                    
                    <Paragraph type="secondary" style={{ display: "block", margin: "0 0 16px 0", minHeight: "36px", fontSize: "12px", lineHeight: "1.5", color: "#6B7280" }} ellipsis={{ rows: 2 }}>
                      {course.description}
                    </Paragraph>
                    
                    {/* Chapters Info */}
                    <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <BookOutlined style={{ color: "#F59E0B", fontSize: "14px" }} /> 
                        <Text style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>
                          {course.lessonCount || 15} Bab
                        </Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <BookOutlined style={{ color: "#F59E0B", fontSize: "14px" }} /> 
                        <Text style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>
                          {course.subLessonCount || 25} Sub Bab
                        </Text>
                      </div>
                    </div>

                    <div style={{ marginTop: "auto" }}>
                      {isEnrolled ? (
                        <>
                          {/* Progress bar */}
                          <div style={{ marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                              <Text style={{ fontWeight: 700, fontSize: "12px", color: "#1F2937" }}>Progress</Text>
                              <Text style={{ fontWeight: 800, color: "#5B21B6", fontSize: "12px" }}>{progressVal}%</Text>
                            </div>
                            <Progress 
                              percent={progressVal} 
                              showInfo={false} 
                              strokeColor="#5B21B6" 
                              railColor="#E5E7EB"
                              size="small" 
                            />
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: "flex", gap: "10px" }}>
                            <Button 
                              type="primary" 
                              icon={<PlayCircleOutlined />}
                              style={{ 
                                flex: 1.2, 
                                backgroundColor: "#5B21B6", 
                                borderRadius: "8px", 
                                fontSize: "13px",
                                fontWeight: 600,
                                border: "none",
                                height: "38px"
                              }}
                              onClick={() => router.push(`/student/level/${course.id}`)}
                            >
                              Resume
                            </Button>
                            <Button 
                              icon={<PieChartOutlined />}
                              style={{ 
                                flex: 1, 
                                borderRadius: "8px", 
                                borderColor: "#5B21B6", 
                                color: "#5B21B6", 
                                fontSize: "13px",
                                fontWeight: 600,
                                height: "38px"
                              }}
                              onClick={() => router.push(`/student/report/${course.id}`)}
                            >
                              View Report
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button 
                          type="primary" 
                          block 
                          style={{ 
                            backgroundColor: "#5B21B6", 
                            borderRadius: "8px", 
                            fontWeight: 700, 
                            color: "#fff",
                            border: "none",
                            height: "40px"
                          }}
                          onClick={() => router.push(`/student/level/${course.id}`)}
                        >
                          Enroll Course
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty description="No courses available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </motion.div>
  );
}
