"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Button, Spin, Empty } from "antd";
import { getAllCoursesApi, getStudentDashboardApi } from "../api/studentApi";
import { useRouter } from "next/navigation";
import { BookOutlined } from "@ant-design/icons";
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
      style={{ padding: '0 12px 24px' }}
    >
      <motion.div variants={itemVariants} style={{ marginBottom: "24px", maxWidth: "800px" }}>
        <Title level={3} style={{ fontWeight: 800, margin: "0 0 8px 0", fontSize: "24px" }}>Take Your Lesson now!</Title>
        <Text style={{ fontSize: "14px", color: "#8c8c8c" }}>
          You can explore and discover various courses available for your learning journey. Browse through a wide range of subjects and topics, and choose the courses that align with your interests and goals.
        </Text>
      </motion.div>

      {courses.length > 0 ? (
        <Row gutter={[24, 24]}>
          {courses.map((course) => {
            const isEnrolled = enrolledMap[course.id];
            
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                <motion.div variants={itemVariants} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }} style={{ height: "100%" }}>
                  <Card 
                    hoverable
                    variant="borderless"
                    style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", height: "100%" }}
                    styles={{ body: { padding: "16px", display: "flex", flexDirection: "column", flex: 1 } }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      style={{ 
                        width: "100%", 
                        height: "140px", 
                        background: course.img_thumbnail ? `url(/assets/courses/${course.img_thumbnail}) center/cover no-repeat` : "linear-gradient(135deg, #F093FB 0%, #F5576C 100%)", 
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px", 
                        marginBottom: "12px" 
                      }}
                    />
                    
                    <Title level={4} style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#262626" }}>{course.course_name}</Title>
                    <Paragraph type="secondary" style={{ display: "block", margin: "0 0 6px 0", minHeight: "34px", fontSize: "12px", lineHeight: "1.4" }} ellipsis={{ rows: 2 }}>
                      {course.description}
                    </Paragraph>
                    
                    <div style={{ display: "flex", gap: "12px", marginBottom: "10px", color: "#bfbfbf" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <BookOutlined /> <Text type="secondary" style={{ fontSize: "11px" }}>{course.lessonCount || 0} Bab</Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <BookOutlined /> <Text type="secondary" style={{ fontSize: "11px" }}>{course.subLessonCount || 0} Sub Bab</Text>
                      </div>
                    </div>

                    <div style={{ marginTop: "auto" }}>
                      {isEnrolled ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <Text style={{ fontWeight: 600, fontSize: "13px" }}>Progress</Text>
                            <Text style={{ fontWeight: 600, color: "#531DAB", fontSize: "13px" }}>{isEnrolled.total_score || 5}%</Text>
                          </div>
                          <Progress percent={isEnrolled.total_score || 5} showInfo={false} strokeColor="#531DAB" style={{ marginBottom: "10px" }} size="small" />
                          <div style={{ display: "flex", gap: "8px" }}>
                            <Button 
                              type="primary" 
                              style={{ flex: 1, backgroundColor: "#531DAB", borderRadius: "6px", fontSize: "13px" }}
                              onClick={() => router.push(`/student/level/${course.id}`)}
                            >
                              Lanjutkan
                            </Button>
                            <Button 
                              style={{ flex: 1, borderRadius: "6px", borderColor: "#531DAB", color: "#531DAB", fontSize: "13px" }}
                            >
                              Report
                            </Button>
                          </div>
                        </>
                      ) : (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            type="primary" 
                            block 
                            style={{ backgroundColor: "#FAAD14", borderRadius: "6px", fontWeight: 600, color: "#fff" }}
                            onClick={() => router.push(`/student/level/${course.id}`)}
                          >
                            Enroll Now
                          </Button>
                        </motion.div>
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
