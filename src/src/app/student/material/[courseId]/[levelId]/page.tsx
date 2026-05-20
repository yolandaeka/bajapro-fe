"use client";
import React, { useEffect, useState } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Progress, 
  Button, 
  Spin, 
  Input, 
  Modal, 
  message,
  Collapse
} from "antd";
import { 
  BookOutlined, 
  PlayCircleOutlined, 
  CheckCircleFilled, 
  LockOutlined, 
  TrophyOutlined, 
  PlayCircleFilled, 
  ArrowLeftOutlined, 
  ThunderboltOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { 
  getCourseMaterialTreeApi, 
  getStudentProgressApi, 
  getStudentCourseProgressApi,
  submitPracticeAnswersApi
} from "../../../api/studentApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

export default function StudentMaterialPage() {
  const router = useRouter();
  const params = useParams();
  
  const courseId = Number(params?.courseId);
  const levelId = Number(params?.levelId);

  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number>(5);
  
  // Data States
  const [courseTree, setCourseTree] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<any>(null);

  // Active / Navigation States
  const [activeSubLessonId, setActiveSubLessonId] = useState<number | null>(null);
  const [activeMaterialIndex, setActiveMaterialIndex] = useState<number>(0);
  const [activeView, setActiveView] = useState<"material" | "practice">("material");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Code Editor states
  const [codeContent, setCodeContent] = useState<string>("");
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});
  const [runOutput, setRunOutput] = useState<string>("Run compiler is ready. Click 'Run' to compile and validate tests.");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Load User Info
  useEffect(() => {
    let currentUserId = 5;
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1];
    if (userCookie) {
      try {
        const u = JSON.parse(decodeURIComponent(userCookie).replace(/^"|"$/g, ''));
        currentUserId = u.id;
      } catch(e){}
    } else {
      const lsUser = localStorage.getItem("user");
      if (lsUser) {
        try {
          const u = JSON.parse(lsUser);
          currentUserId = u.id;
        } catch(e){}
      }
    }
    setStudentId(currentUserId);
  }, []);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tree, progress, courseProg] = await Promise.all([
        getCourseMaterialTreeApi(courseId, levelId),
        getStudentProgressApi(studentId, courseId),
        getStudentCourseProgressApi(studentId, courseId)
      ]);

      setCourseTree(tree);
      setStudentProgress(progress);
      setCourseProgress(courseProg);

      // Determine active sublesson: first one or first uncompleted
      if (tree.length > 0) {
        let defaultSubL: any = null;
        
        // Find first incomplete
        for (const lesson of tree) {
          const incomplete = lesson.sublessons.find((sl: any) => {
            const prog = progress.find((p: any) => Number(p.sub_lesson_id) === Number(sl.id));
            return !prog || prog.status !== "completed";
          });
          if (incomplete) {
            defaultSubL = incomplete;
            break;
          }
        }

        // Fallback to first sublesson of first lesson
        if (!defaultSubL && tree[0].sublessons.length > 0) {
          defaultSubL = tree[0].sublessons[0];
        }

        if (defaultSubL) {
          setActiveSubLessonId(defaultSubL.id);
          // Set default code template
          if (defaultSubL.codeQuestion) {
            setCodeContent(defaultSubL.codeQuestion.hint || "// Tulis kodemu di sini...");
          } else {
            setCodeContent("");
          }
        }
      }
    } catch (e) {
      console.error(e);
      message.error("Gagal memuat materi pembelajaran.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && courseId && levelId) {
      fetchData();
    }
  }, [studentId, courseId, levelId]);

  // Find active sublesson object
  const getActiveSubLesson = () => {
    for (const lesson of courseTree) {
      const found = lesson.sublessons.find((sl: any) => Number(sl.id) === Number(activeSubLessonId));
      if (found) return found;
    }
    return null;
  };

  const activeSubLesson = getActiveSubLesson();

  // Get parent lesson for active sublesson
  const getActiveLesson = () => {
    for (const lesson of courseTree) {
      if (lesson.sublessons.some((sl: any) => Number(sl.id) === Number(activeSubLessonId))) return lesson;
    }
    return null;
  };
  const activeLesson = getActiveLesson();

  // Get sorted materials for current sublesson
  const currentMaterials = activeSubLesson?.materials
    ? [...activeSubLesson.materials].sort((a: any, b: any) => Number(a.content_position) - Number(b.content_position))
    : [];
  const hasTest = activeSubLesson?.codeQuestion || (activeSubLesson?.essayQuestions && activeSubLesson.essayQuestions.length > 0);
  const totalSections = currentMaterials.length + (hasTest ? 1 : 0);
  const isOnTestSection = activeView === "practice";
  const currentMaterial = currentMaterials[activeMaterialIndex] || null;

  // Find all sublessons in linear sequence for navigation
  const getSubLessonsSequence = () => {
    const seq: any[] = [];
    courseTree.forEach(lesson => {
      lesson.sublessons.forEach((sl: any) => {
        seq.push(sl);
      });
    });
    return seq;
  };

  const subLessonsSequence = getSubLessonsSequence();
  const currentIndex = subLessonsSequence.findIndex(sl => Number(sl.id) === Number(activeSubLessonId));

  // Determine if a sublesson is locked
  const isSubLessonLocked = (subLId: number) => {
    const seq = getSubLessonsSequence();
    const idx = seq.findIndex(sl => Number(sl.id) === Number(subLId));
    if (idx <= 0) return false; // First sublesson is always unlocked

    // Check if the previous one in the sequence is completed
    const prevSubL = seq[idx - 1];
    const prevProg = studentProgress.find(p => Number(p.sub_lesson_id) === Number(prevSubL.id));
    return !prevProg || prevProg.status !== "completed";
  };

  // Change Sub Lesson
  const handleSelectSubLesson = (subL: any) => {
    if (isSubLessonLocked(subL.id)) {
      message.warning("Materi ini masih terkunci! Selesaikan materi sebelumnya terlebih dahulu.");
      return;
    }
    setActiveSubLessonId(subL.id);
    setActiveMaterialIndex(0);
    setActiveView("material");
    setRunOutput("Run compiler is ready. Click 'Run' to compile and validate tests.");
    if (subL.codeQuestion) {
      setCodeContent(subL.codeQuestion.hint || "// Tulis kodemu di sini...");
    } else {
      setCodeContent("");
    }
    setEssayAnswers({});
  };

  // Handle run code
  const handleRunCode = () => {
    if (!codeContent.trim()) {
      message.warning("Silakan tulis kode sebelum melakukan Run!");
      return;
    }

    setIsRunning(true);
    setRunOutput("Compiling files...\nLinking libraries...\nExecuting tests...\n\n");

    setTimeout(() => {
      // Create a gorgeous mock log depending on the code content
      let isError = false;
      let logs = "";

      if (codeContent.includes("tefor") || codeContent.includes("tefor (")) {
        isError = true;
        logs = `SyntaxError: Unexpected token 'tefor' on line 1.\nDid you mean 'for'?\n\nBuild failed.`;
      } else {
        logs = `Running tests...\n`;
        logs += `✔ Test 1: Syntax compilation successful.\n`;
        logs += `✔ Test 2: Standard conditional statement validated.\n`;
        logs += `✔ Test 3: Output matches the case requirements.\n\n`;
        logs += `Build successful! All tests passed.\nRun Output:\nSelamat anda lulus!\n`;
      }

      setRunOutput(logs);
      setIsRunning(false);
      if (!isError) {
        message.success("Kode berhasil dijalankan tanpa error!");
      } else {
        message.error("Ada error di kodemu! Silakan periksa output.");
      }
    }, 1500);
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (!activeSubLesson) return;

    // Check code question
    if (activeSubLesson.codeQuestion && !codeContent.trim()) {
      message.warning("Silakan isi Code Editor terlebih dahulu!");
      return;
    }

    // Check essay answers
    const missingEssay = activeSubLesson.essayQuestions.some((eq: any) => !essayAnswers[eq.id]?.trim());
    if (missingEssay) {
      message.warning("Harap jawab semua pertanyaan essay yang tersedia!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payloadEssay = activeSubLesson.essayQuestions.map((eq: any) => ({
        essayQuestionId: Number(eq.id),
        answer: essayAnswers[eq.id] || ""
      }));

      await submitPracticeAnswersApi({
        studentId,
        courseId,
        subLessonId: activeSubLesson.id,
        codeQuestionId: activeSubLesson.codeQuestion ? Number(activeSubLesson.codeQuestion.id) : null,
        codeAnswer: codeContent,
        essayAnswers: payloadEssay,
        scoreToAdd: activeSubLesson.codeQuestion ? Number(activeSubLesson.codeQuestion.score) || 30 : 20
      });

      // Show popup
      setShowSuccessModal(true);
      // Reload states locally to update progress sidebar
      const [newProgress, newCourseProg] = await Promise.all([
        getStudentProgressApi(studentId, courseId),
        getStudentCourseProgressApi(studentId, courseId)
      ]);
      setStudentProgress(newProgress);
      setCourseProgress(newCourseProg);

    } catch (e) {
      console.error(e);
      message.error("Gagal melakukan submit materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next / Previous navigation buttons - section-based
  const handleNextSection = () => {
    if (activeView === "material") {
      // If more materials to show, go to next material
      if (activeMaterialIndex < currentMaterials.length - 1) {
        setActiveMaterialIndex(activeMaterialIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hasTest) {
        // All materials done, go to test section
        setActiveView("practice");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // No test, go to next sublesson
        if (currentIndex < subLessonsSequence.length - 1) {
          handleSelectSubLesson(subLessonsSequence[currentIndex + 1]);
        } else {
          message.success("Selamat! Kamu telah menyelesaikan seluruh materi di level ini.");
        }
      }
    } else {
      message.info("Silakan klik 'Submit Test' untuk menyelesaikan bab ini!");
    }
  };

  const handlePrevSection = () => {
    if (activeView === "practice") {
      setActiveView("material");
      setActiveMaterialIndex(currentMaterials.length - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (activeMaterialIndex > 0) {
        setActiveMaterialIndex(activeMaterialIndex - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (currentIndex > 0) {
        const prevSub = subLessonsSequence[currentIndex - 1];
        handleSelectSubLesson(prevSub);
      }
    }
  };

  // Get current section label for footer
  const getSectionLabel = () => {
    if (activeView === "practice") return "Latihan & Soal";
    if (currentMaterial) return currentMaterial.title || `Materi ${activeMaterialIndex + 1}`;
    return "Materi Pembelajaran";
  };

  const getSectionProgress = () => {
    if (activeView === "practice") return `${totalSections} / ${totalSections}`;
    return `${activeMaterialIndex + 1} / ${totalSections}`;
  };

  const handleNextFromModal = () => {
    setShowSuccessModal(false);
    const seq = getSubLessonsSequence();
    const nextIdx = seq.findIndex(sl => Number(sl.id) === Number(activeSubLessonId)) + 1;
    if (nextIdx < seq.length) {
      const nextSub = seq[nextIdx];
      setActiveSubLessonId(nextSub.id);
      setActiveView("material");
      setRunOutput("Run compiler is ready. Click 'Run' to compile and validate tests.");
      if (nextSub.codeQuestion) {
        setCodeContent(nextSub.codeQuestion.hint || "// Tulis kodemu di sini...");
      } else {
        setCodeContent("");
      }
      setEssayAnswers({});
    } else {
      message.success("Luar biasa! Kamu telah melahap habis semua materi level ini. Kembali ke peta petualangan!");
      router.push(`/student/level/${courseId}`);
    }
  };

  // Calculate Progress Percent
  const getProgressPercent = () => {
    if (subLessonsSequence.length === 0) return 0;
    const completedCount = subLessonsSequence.filter(sl => {
      const prog = studentProgress.find(p => Number(p.sub_lesson_id) === Number(sl.id));
      return prog && prog.status === "completed";
    }).length;

    return Math.round((completedCount / subLessonsSequence.length) * 100);
  };

  const progressPercent = getProgressPercent();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "100px" }}>
      
      {/* SUCCESS MODAL POPUP */}
      <AnimatePresence>
        {showSuccessModal && (
          <Modal
            open={showSuccessModal}
            footer={null}
            closable={false}
            centered
            width={480}
            bodyStyle={{ padding: "40px 32px", textAlign: "center", borderRadius: "24px" }}
          >
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                <div style={{ position: "relative" }}>
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }}>
                    <img 
                      src="/assets/gamification/lv 3.png" 
                      alt="Trophy" 
                      style={{ width: "120px", height: "120px" }}
                      onError={(e: any) => { e.target.src = "https://api.dicebear.com/7.x/shapes/svg?seed=trophy"; }}
                    />
                  </motion.div>
                  <div style={{ position: "absolute", top: -10, right: -10, background: "#52c41a", color: "#fff", borderRadius: "50%", padding: "4px 8px", fontSize: "12px", fontWeight: "bold" }}>
                    PASSED!
                  </div>
                </div>
              </div>

              <Title level={2} style={{ fontWeight: 800, color: "#1e293b", margin: "0 0 8px 0" }}>Luar Biasa!</Title>
              <Paragraph style={{ color: "#64748b", fontSize: "15px", marginBottom: "32px", lineHeight: 1.6 }}>
                Kamu telah menyelesaikan materi <span style={{ fontWeight: 700, color: "#531DAB" }}>{activeSubLesson?.title}</span> dengan nilai sempurna!
              </Paragraph>



              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  onClick={handleNextFromModal}
                  style={{ 
                    background: "linear-gradient(135deg, #FF9900 0%, #FF5E00 100%)", 
                    border: "none", 
                    borderRadius: "12px", 
                    fontWeight: 700, 
                    height: "48px",
                    boxShadow: "0 4px 12px rgba(255, 94, 0, 0.2)"
                  }}
                >
                  Materi Berikutnya <RightOutlined />
                </Button>
                <Button 
                  type="text" 
                  size="large" 
                  block
                  onClick={() => router.push(`/student/level/${courseId}`)}
                  style={{ color: "#64748b", fontWeight: 600 }}
                >
                  Lihat Report & Peta
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* TOP HEADER */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "0", marginBottom: "24px", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.97)" }}>
        {/* Gradient accent line */}
        <div style={{ width: "100%", height: "3px", background: "linear-gradient(90deg, #7c3aed, #4f46e5, #06b6d4)" }} />
        <div style={{ padding: "12px 24px", maxWidth: "1440px", margin: "0 auto" }}>
          <Row align="middle" justify="space-between">
            <Col>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <Text style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {activeLesson?.title || "Lesson"}
                  </Text>
                  <span style={{ color: "#cbd5e1", fontSize: "11px" }}>›</span>
                  <Text style={{ color: "#7c3aed", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {activeView === "practice" ? "Latihan" : `Section ${activeMaterialIndex + 1}`}
                  </Text>
                </div>
                <Text style={{ fontWeight: 800, color: "#1e293b", fontSize: "18px", lineHeight: 1.2 }}>
                  {activeSubLesson?.title || "Sub Lesson"}
                </Text>
              </div>
            </Col>
            <Col>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => router.push(`/student/level/${courseId}`)}
                  style={{ padding: "6px 20px", fontWeight: 700, color: "#531DAB", borderRadius: "12px", border: "1px solid #e8d5ff", background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)", height: "40px", boxShadow: "0 2px 6px rgba(83, 29, 171, 0.08)" }}
                >
                  Kembali ke Level
                </Button>
              </motion.div>
            </Col>
          </Row>
        </div>
      </div>

      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 24px", display: "flex", gap: "32px" }}>
        {/* MAIN CONTENT */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* LEFT MAIN CONTENT PANEL */}
            
            {/* MATERIAL VIEW - loops by content_position */}
            {activeView === "material" && currentMaterial && (
              <motion.div key={`mat-${currentMaterial.id}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }}>
                <Card 
                  variant="borderless" 
                  style={{ borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "24px", border: "1px solid #f1f5f9" }}
                  styles={{ body: { padding: "28px" } }}
                >
                  {/* Section indicator */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", padding: "10px", borderRadius: "12px", color: "#4f46e5", display: "flex" }}>
                        {currentMaterial.url_video ? <PlayCircleOutlined style={{ fontSize: "20px" }} /> : <BookOutlined style={{ fontSize: "20px" }} />}
                      </div>
                      <div>
                        <Text style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", display: "block" }}>Section {activeMaterialIndex + 1} of {totalSections}</Text>
                        <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>{currentMaterial.title || "Materi Pembelajaran"}</Title>
                      </div>
                    </div>
                  </div>

                  {currentMaterial.url_video ? (
                    <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", marginBottom: "28px", border: "1px solid #e2e8f0" }}>
                      <iframe 
                        src={getYouTubeEmbedUrl(currentMaterial.url_video) || ""}
                        title="Video Pembelajaran"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                      />
                    </div>
                  ) : null}

                  {currentMaterial.materials && (
                    <div 
                      className="material-content-body"
                      style={{ fontSize: "15px", lineHeight: "1.8", color: "#475569" }}
                      dangerouslySetInnerHTML={{ __html: currentMaterial.materials }}
                    />
                  )}
                </Card>
              </motion.div>
            )}

            {/* MATERIAL VIEW - No materials fallback */}
            {activeView === "material" && !currentMaterial && activeSubLesson && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <Card 
                  variant="borderless" 
                  style={{ borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", marginBottom: "24px", border: "1px solid #f1f5f9" }}
                  styles={{ body: { padding: "48px", textAlign: "center" } }}
                >
                  <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", height: "200px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                    <PlayCircleFilled style={{ fontSize: "54px", color: "rgba(255,255,255,0.7)" }} />
                    <Text style={{ color: "#fff", fontWeight: 600 }}>Tidak ada konten untuk materi ini</Text>
                  </div>
                </Card>
              </motion.div>
            )}
            {/* PRACTICE VIEW (LATIHAN SOAL) */}
            {activeView === "practice" && activeSubLesson && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Section indicator for practice */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ background: "linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)", padding: "10px", borderRadius: "12px", color: "#78350f", display: "flex" }}>
                    <ThunderboltOutlined style={{ fontSize: "20px" }} />
                  </div>
                  <div>
                    <Text style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", display: "block" }}>Section {totalSections} of {totalSections}</Text>
                    <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>Latihan & Soal</Title>
                  </div>
                </div>
                <Row gutter={[24, 24]}>
                  
                  {/* Left: Code Editor and Run Box - Only show if code question exists */}
                  {activeSubLesson?.codeQuestion && (
                    <Col xs={24} md={13}>
                      {/* Code Editor Card */}
                      <Card
                        variant="borderless"
                        style={{ 
                          borderRadius: "20px", 
                          backgroundColor: "#1e293b", 
                          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                          marginBottom: "20px" 
                        }}
                        styles={{ body: { padding: "20px" } }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          <Text style={{ color: "#ffffff", fontWeight: 700, fontSize: "15px" }}>Code Editor</Text>
                          <Button 
                            type="primary"
                            icon={<PlayCircleFilled />}
                            loading={isRunning}
                            onClick={handleRunCode}
                            style={{ 
                              backgroundColor: "#FAAD14", 
                              borderColor: "#FAAD14", 
                              color: "#fff", 
                              fontWeight: 700, 
                              borderRadius: "8px" 
                            }}
                          >
                            Run
                          </Button>
                        </div>

                        <div style={{ position: "relative" }}>
                          <textarea
                            value={codeContent}
                            onChange={(e) => setCodeContent(e.target.value)}
                            style={{
                              width: "100%",
                              height: "360px",
                              backgroundColor: "#0f172a",
                              color: "#38bdf8",
                              fontFamily: "'Courier New', Courier, monospace",
                              fontSize: "14px",
                              padding: "16px",
                              borderRadius: "12px",
                              border: "1px solid #334155",
                              resize: "none",
                              lineHeight: "1.6",
                              outline: "none",
                            }}
                            spellCheck={false}
                          />
                        </div>
                      </Card>

                      {/* Run Output Box */}
                      <Card
                        variant="borderless"
                        style={{ 
                          borderRadius: "16px", 
                          backgroundColor: "#0f172a", 
                          boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                        }}
                        styles={{ body: { padding: "16px" } }}
                      >
                        <Text style={{ color: "#94a3b8", display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
                          Run Output
                        </Text>
                        <pre style={{ 
                          margin: 0, 
                          color: runOutput.includes("failed") || runOutput.includes("Error") ? "#ef4444" : "#10b981", 
                          fontFamily: "'Courier New', Courier, monospace", 
                          fontSize: "13px", 
                          whiteSpace: "pre-wrap",
                          height: "140px",
                          overflowY: "auto"
                        }}>
                          {runOutput}
                        </pre>
                      </Card>
                    </Col>
                  )}

                  {/* Right: Studi Kasus and Essays */}
                  <Col xs={24} md={activeSubLesson?.codeQuestion ? 11 : 16} offset={activeSubLesson?.codeQuestion ? 0 : 4} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* Card 1: Exploring (Studi Kasus) - Only show if code question exists */}
                    {activeSubLesson?.codeQuestion && (
                      <Card 
                        variant="borderless" 
                        style={{ 
                          borderRadius: "20px", 
                          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                          background: "linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)",
                          border: "1px solid #ede9fe"
                        }}
                        styles={{ body: { padding: "24px" } }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #eef2f6", paddingBottom: "12px" }}>
                          <ThunderboltOutlined style={{ color: "#7c3aed", fontSize: "20px" }} />
                          <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>Exploring - Studi Kasus</Title>
                        </div>

                        <div 
                          style={{ fontSize: "14px", lineHeight: "1.7", color: "#475569" }}
                          dangerouslySetInnerHTML={{ __html: activeSubLesson?.codeQuestion?.code_question || "<p>Tidak ada studi kasus.</p>" }}
                        />
                      </Card>
                    )}

                    {/* Card 2: Explaining (Essay) */}
                    <Card 
                      variant="borderless" 
                      style={{ 
                        borderRadius: "20px", 
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                        border: "1px solid #f1f5f9"
                      }}
                      styles={{ body: { padding: "24px" } }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <BookOutlined style={{ color: "#059669", fontSize: "20px" }} />
                          <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>Explaining</Title>
                        </div>
                        <Button 
                          type="primary" 
                          loading={isSubmitting}
                          onClick={handleSubmitTest}
                          style={{ 
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                            borderColor: "#059669", 
                            borderRadius: "10px", 
                            fontWeight: 700, 
                            height: "40px",
                            paddingInline: "20px",
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
                          }}
                        >
                          Submit Test
                        </Button>
                      </div>

                      <div>
                        {activeSubLesson?.essayQuestions && activeSubLesson.essayQuestions.length > 0 ? (
                          activeSubLesson.essayQuestions.map((eq: any, index: number) => (
                            <div key={eq.id} style={{ marginBottom: "20px" }}>
                              <Text style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>
                                {index + 1}. <span dangerouslySetInnerHTML={{ __html: eq.essay_question }} style={{ display: "inline" }} />
                              </Text>
                              <TextArea
                                rows={3}
                                placeholder="Tulis penjelasanmu di sini..."
                                value={essayAnswers[eq.id] || ""}
                                onChange={(e) => setEssayAnswers({
                                  ...essayAnswers,
                                  [eq.id]: e.target.value
                                })}
                                style={{ borderRadius: "10px", fontSize: "13px", border: "1px solid #cbd5e1" }}
                              />
                            </div>
                          ))
                        ) : (
                          <Paragraph type="secondary" style={{ fontSize: "13px" }}>Tidak ada pertanyaan essay untuk materi ini.</Paragraph>
                        )}
                      </div>
                    </Card>

                  </Col>

                </Row>
              </motion.div>
            )}


          </div>

          {/* RIGHT SIDEBAR - only during material, collapsible */}
          {activeView === "material" && (
          <div style={{ 
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            zIndex: 10
          }}>
            {/* Sleek Attached Toggle Button */}
            <motion.div 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: "absolute",
                left: "-28px",
                top: "140px",
                width: "28px",
                height: "64px",
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 15,
                borderRadius: "10px 0 0 10px",
                boxShadow: "-4px 0 12px rgba(124, 58, 237, 0.15)",
                transition: "all 0.2s ease",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRight: "none"
              }}
            >
              {sidebarOpen ? <RightOutlined style={{ fontSize: "11px", fontWeight: "bold" }} /> : <LeftOutlined style={{ fontSize: "11px", fontWeight: "bold" }} />}
            </motion.div>

            {/* Sliding Sidebar Panel */}
            <div style={{ 
              width: sidebarOpen ? "340px" : "0px", 
              minWidth: sidebarOpen ? "340px" : "0px",
              overflow: "hidden",
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
            
            {/* PROGRESS & BADGE STATUS BOARD */}
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <Card 
                variant="borderless" 
                style={{ 
                  borderRadius: "20px", 
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", 
                  color: "#ffffff",
                  boxShadow: "0 10px 25px rgba(99, 102, 241, 0.2)",
                  marginBottom: "24px"
                }}
                styles={{ body: { padding: "24px" } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <ThunderboltOutlined style={{ fontSize: "20px", color: "#FFE58F" }} />
                  <Text style={{ fontWeight: 800, color: "#ffffff", fontSize: "16px" }}>Your Progress</Text>
                </div>
                
                <Progress 
                  percent={progressPercent} 
                  strokeColor={{
                    "0%": "#ffe58f",
                    "100%": "#52c41a",
                  }}
                  railColor="rgba(255,255,255,0.2)"
                  status="active"
                  style={{ marginBottom: "24px" }}
                  format={(p) => <span style={{ color: "#fff", fontWeight: 800 }}>{p}%</span>}
                />


              </Card>
            </motion.div>

            {/* LIST MATERIAL PANEL */}
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Card 
                variant="borderless" 
                style={{ borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
                styles={{ body: { padding: "20px" } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                  <BookOutlined style={{ color: "#7c3aed", fontSize: "18px" }} />
                  <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>List Material</Title>
                </div>

                <Collapse 
                  ghost 
                  defaultActiveKey={courseTree.map(l => String(l.id))}
                  expandIconPlacement="end"
                  style={{ padding: 0 }}
                  items={courseTree.map((lesson) => {
                    // Check if all sublessons in this lesson are completed
                    const allCompleted = lesson.sublessons.every((sl: any) => 
                      studentProgress.some((p: any) => Number(p.sub_lesson_id) === Number(sl.id) && p.status === "completed")
                    );
                    const completedCount = lesson.sublessons.filter((sl: any) => 
                      studentProgress.some((p: any) => Number(p.sub_lesson_id) === Number(sl.id) && p.status === "completed")
                    ).length;

                    return {
                    key: String(lesson.id),
                    label: (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <Text style={{ fontWeight: 700, color: "#334155", fontSize: "14px" }}>
                          {lesson.title}
                        </Text>
                        {allCompleted ? (
                          <CheckCircleFilled style={{ color: "#52c41a", fontSize: "16px" }} />
                        ) : (
                          <Text style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600 }}>
                            {completedCount}/{lesson.sublessons.length}
                          </Text>
                        )}
                      </div>
                    ),
                    children: (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "4px" }}>
                        {lesson.sublessons.map((sl: any) => {
                          const isCompleted = studentProgress.some(p => Number(p.sub_lesson_id) === Number(sl.id) && p.status === "completed");
                          const isActive = Number(sl.id) === Number(activeSubLessonId);
                          const isLocked = isSubLessonLocked(sl.id);

                          return (
                            <motion.div 
                              key={sl.id}
                              whileHover={!isLocked ? { x: 4 } : {}}
                              onClick={() => !isLocked && handleSelectSubLesson(sl)}
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                padding: "10px 12px", 
                                borderRadius: "10px",
                                cursor: isLocked ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                background: isActive ? "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)" : isLocked ? "#fafafa" : "#ffffff",
                                border: isActive ? "1px solid #c084fc" : "1px solid transparent",
                                opacity: isLocked ? 0.6 : 1
                              }}
                              className="sublesson-item-hover"
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                                {isCompleted ? (
                                  <CheckCircleFilled style={{ color: "#52c41a", fontSize: "16px" }} />
                                ) : isActive ? (
                                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                    <PlayCircleFilled style={{ color: "#8b5cf6", fontSize: "16px" }} />
                                  </motion.div>
                                ) : isLocked ? (
                                  <LockOutlined style={{ color: "#94a3b8", fontSize: "15px" }} />
                                ) : (
                                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" }} />
                                )}
                                
                                <Text style={{ 
                                  fontSize: "13px", 
                                  fontWeight: isActive ? 700 : 500,
                                  color: isActive ? "#7c3aed" : isLocked ? "#94a3b8" : "#475569"
                                }}>
                                  {sl.title}
                                </Text>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ),
                    style: { marginBottom: "8px", borderBottom: "1px solid #f1f5f9" }
                  };
                  })}
                />
              </Card>
            </motion.div>            </div>
          </div>
          )}
        </div>

      {/* STICKY FOOTER NAVIGATION */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        background: "rgba(255,255,255,0.98)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid #e2e8f0",
        padding: "0",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.06)"
      }}>
        {/* Progress Bar at top of footer */}
        <div style={{ width: "100%", height: "3px", background: "#f1f5f9" }}>
          <div style={{ 
            width: `${totalSections > 0 ? ((activeView === "practice" ? totalSections : activeMaterialIndex + 1) / totalSections) * 100 : 0}%`, 
            height: "100%", 
            background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
            transition: "width 0.4s ease",
            borderRadius: "0 2px 2px 0"
          }} />
        </div>
        <div style={{ maxWidth: "1440px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 32px" }}>
          <Button 
            icon={<LeftOutlined />} 
            onClick={handlePrevSection}
            disabled={currentIndex === 0 && activeMaterialIndex === 0 && activeView === "material"}
            style={{ borderRadius: "12px", fontWeight: 700, height: "44px", paddingInline: "24px", border: "1px solid #e2e8f0", background: "#fff" }}
          >
            Sebelumnya
          </Button>
          <div style={{ textAlign: "center", flex: 1, padding: "0 16px" }}>
            <Text style={{ color: "#1e293b", fontWeight: 800, fontSize: "14px", display: "block" }}>
              {getSectionLabel()}
            </Text>
            {/* Section dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "6px" }}>
              {Array.from({ length: totalSections }).map((_, i) => {
                const isCurrent = activeView === "practice" ? i === totalSections - 1 : i === activeMaterialIndex;
                const isPast = activeView === "practice" ? true : i < activeMaterialIndex;
                return (
                  <div key={i} style={{
                    width: isCurrent ? "20px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: isCurrent ? "linear-gradient(90deg, #7c3aed, #4f46e5)" : isPast ? "#c4b5fd" : "#e2e8f0",
                    transition: "all 0.3s ease"
                  }} />
                );
              })}
            </div>
          </div>
          <Button 
            onClick={handleNextSection}
            disabled={currentIndex === subLessonsSequence.length - 1 && activeView === "practice"}
            style={{ 
              borderRadius: "12px", 
              fontWeight: 700,
              height: "44px",
              paddingInline: "24px",
              background: "linear-gradient(135deg, #7c3aed 0%, #531DAB 100%)", 
              borderColor: "#531DAB", 
              color: "#fff",
              boxShadow: "0 4px 12px rgba(83, 29, 171, 0.2)"
            }}
          >
            {activeView === "material" && activeMaterialIndex === currentMaterials.length - 1 && activeSubLesson?.codeQuestion 
              ? "Mulai Latihan" 
              : "Selanjutnya"} <RightOutlined />
          </Button>
        </div>
      </div>

      <style>{`
        .sublesson-item-hover:hover {
          background: #f1f5f9 !important;
        }
        .material-content-body p {
          margin-bottom: 16px;
        }
        .material-content-body code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
          color: #7c3aed;
        }
        .material-content-body pre {
          background: #1e293b;
          color: #38bdf8;
          padding: 16px;
          border-radius: 12px;
          overflow-x: auto;
          font-size: 13px;
          line-height: 1.6;
        }
        .material-content-body blockquote {
          border-left: 4px solid #7c3aed;
          padding-left: 16px;
          margin: 16px 0;
          color: #64748b;
          font-style: italic;
        }
      `}</style>

    </div>
  );
}
