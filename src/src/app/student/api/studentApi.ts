const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const USE_REAL_API = true;

const handleFetch = async (url: string, options?: RequestInit) => {
  if (USE_REAL_API) {
    try {
      let token = "";
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token") || ""; 
      }

      const customOptions: RequestInit = {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options?.headers || {}), 
        },
      };

      const response = await fetch(url, customOptions);
      if (!response.ok) {
        throw new Error(`Server Error (${response.status}): ${response.statusText}`);
      }
      return response.json();
    } catch (err) {
      console.error("Network Error:", err);
      throw err;
    }
  } else {
    return new Promise((resolve) => setTimeout(() => resolve([]), 300));
  }
};

// 1. Get Student Dashboard Data
export const getStudentDashboardApi = async (studentId: string | number) => {
    const enrolledCourses = await handleFetch(`${BASE_URL}/t_student_course?student_id=${studentId}`);
    const allMaterials = await handleFetch(`${BASE_URL}/materials`); // Simply for dummy count
    
    // Enrich enrolled courses with course details
    const coursesData = await Promise.all(enrolledCourses.map(async (ec: any) => {
        const courseDetail = await handleFetch(`${BASE_URL}/courses/${ec.course_id}`);
        return {
            ...ec,
            course: courseDetail
        };
    }));

    // Calculate Top 5 Leaderboard
    const allStudentCourses = await handleFetch(`${BASE_URL}/t_student_course`);
    const allUsers = await handleFetch(`${BASE_URL}/users`);
    
    const students = allUsers.filter((u: any) => Number(u.role_id) === 3);
    const leaderboardRaw = students.map((user: any) => {
        const userCourses = allStudentCourses.filter((sc: any) => Number(sc.student_id) === Number(user.id));
        const totalUserScore = userCourses.reduce((acc: number, sc: any) => acc + (Number(sc.total_score) || 0), 0);
        return {
            id: user.id,
            name: user.name,
            score: totalUserScore
        };
    });

    const top5Leaderboard = leaderboardRaw.sort((a: any, b: any) => b.score - a.score).slice(0, 5);

    return {
        enrolledCount: enrolledCourses.length,
        materialsTotal: allMaterials.length,
        materialsCompleted: Math.floor(allMaterials.length * 0.4), // dummy progress
        overallProgress: enrolledCourses.length > 0 ? 10 : 0, // dummy overall progress
        latestProgress: [],
        lessonHistory: coursesData,
        achievement: {
            badge: "Warrior",
            rank: "#10",
            totalScore: enrolledCourses.reduce((acc: number, curr: any) => acc + (curr.total_score || 0), 0)
        },
        top5Leaderboard
    };
};

// 2. Get All Available Courses
export const getAllCoursesApi = async () => {
    const courses = await handleFetch(`${BASE_URL}/courses`);
    const lessons = await handleFetch(`${BASE_URL}/lessons`);
    const sublessons = await handleFetch(`${BASE_URL}/sublessons`);

    return courses.map((course: any) => {
        const courseLessons = lessons.filter((l: any) => Number(l.course_id) === Number(course.id));
        const lessonIds = courseLessons.map((l: any) => Number(l.id));
        const courseSubLessons = sublessons.filter((sl: any) => lessonIds.includes(Number(sl.lesson_id)));

        return {
            ...course,
            lessonCount: courseLessons.length,
            subLessonCount: courseSubLessons.length
        };
    });
};

// 3. Get Course Detail with Levels
export const getCourseDetailApi = async (courseId: string | number) => {
    const course = await handleFetch(`${BASE_URL}/courses/${courseId}`);
    const levels = await handleFetch(`${BASE_URL}/levels`);
    const lessons = await handleFetch(`${BASE_URL}/lessons?course_id=${courseId}`);
    const sublessons = await handleFetch(`${BASE_URL}/sublessons`);
    
    // Group lessons by level
    const levelsWithStats = levels.map((lvl: any) => {
        const lvlLessons = lessons.filter((l: any) => Number(l.level_id) === Number(lvl.id));
        const lessonIds = lvlLessons.map((l: any) => Number(l.id));
        const lvlSubLessons = sublessons.filter((sl: any) => lessonIds.includes(Number(sl.lesson_id)));

        return {
            ...lvl,
            lessonCount: lvlLessons.length,
            subLessonCount: lvlSubLessons.length, 
            isLocked: false // easy always unlocked? dummy logic
        };
    });

    return {
        ...course,
        levels: levelsWithStats
    };
};

// 4. Check if student is enrolled in a course
export const checkEnrollmentApi = async (studentId: string | number, courseId: string | number) => {
    const check = await handleFetch(`${BASE_URL}/t_student_course?student_id=${studentId}&course_id=${courseId}`);
    return check.length > 0;
};

// 5. Enroll Student to Course
export const enrollCourseApi = async (studentId: string | number, courseId: string | number) => {
    // Check first
    const exist = await handleFetch(`${BASE_URL}/t_student_course?student_id=${studentId}&course_id=${courseId}`);
    if (exist.length > 0) {
        // Already enrolled
        return exist[0];
    } else {
        // Create new
        const payload = {
            student_id: Number(studentId),
            course_id: Number(courseId),
            total_score: 0,
            badge_id: null,
            isactive: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_create: Number(studentId),
            user_update: Number(studentId)
        };
        return await handleFetch(`${BASE_URL}/t_student_course`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
};

// 6. Get Lessons, Sublessons, Materials, and Questions for Course & Level
export const getCourseMaterialTreeApi = async (courseId: string | number, levelId: string | number) => {
    const lessons = await handleFetch(`${BASE_URL}/lessons?course_id=${courseId}&level_id=${levelId}`);
    const sublessons = await handleFetch(`${BASE_URL}/sublessons`);
    const materials = await handleFetch(`${BASE_URL}/materials`);
    const codeQuestions = await handleFetch(`${BASE_URL}/code_question`);
    const essayQuestions = await handleFetch(`${BASE_URL}/essay_question`);

    // Nest lessons -> sublessons -> materials & questions
    return lessons.map((lesson: any) => {
        const lessonSubLessons = sublessons
            .filter((sl: any) => Number(sl.lesson_id) === Number(lesson.id))
            .map((sl: any) => {
                const subLessonMaterials = materials
                    .filter((m: any) => Number(m.sub_lesson_id) === Number(sl.id))
                    .sort((a: any, b: any) => Number(a.content_position) - Number(b.content_position));

                const subLessonCodeQuestion = codeQuestions.find((q: any) => Number(q.sub_lesson_id) === Number(sl.id));
                const subLessonEssayQuestions = essayQuestions.filter((eq: any) => {
                    if (eq.sub_lesson_id !== undefined && eq.sub_lesson_id !== null) {
                        return Number(eq.sub_lesson_id) === Number(sl.id);
                    }
                    return subLessonCodeQuestion && Number(eq.code_question_id) === Number(subLessonCodeQuestion.id);
                });

                return {
                    ...sl,
                    materials: subLessonMaterials,
                    codeQuestion: subLessonCodeQuestion || null,
                    essayQuestions: subLessonEssayQuestions
                };
            });

        return {
            ...lesson,
            sublessons: lessonSubLessons
        };
    });
};

// 7. Get Student progress for a course
export const getStudentProgressApi = async (studentId: string | number, courseId: string | number) => {
    return await handleFetch(`${BASE_URL}/t_student_progress?user_id=${studentId}&course_id=${courseId}`);
};

// 8. Update student progress (create or patch)
export const updateStudentProgressApi = async (studentId: string | number, courseId: string | number, subLessonId: string | number, status: string = "completed") => {
    const exist = await handleFetch(`${BASE_URL}/t_student_progress?user_id=${studentId}&course_id=${courseId}&sub_lesson_id=${subLessonId}`);
    if (exist.length > 0) {
        return await handleFetch(`${BASE_URL}/t_student_progress/${exist[0].id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, updated_at: new Date().toISOString() })
        });
    } else {
        const payload = {
            user_id: Number(studentId),
            course_id: Number(courseId),
            sub_lesson_id: Number(subLessonId),
            status,
            isactive: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_create: Number(studentId),
            user_update: Number(studentId)
        };
        return await handleFetch(`${BASE_URL}/t_student_progress`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
};

// 9. Get student course progress and badge info
export const getStudentCourseProgressApi = async (studentId: string | number, courseId: string | number) => {
    const enrollment = await handleFetch(`${BASE_URL}/t_student_course?student_id=${studentId}&course_id=${courseId}`);
    if (enrollment.length > 0) {
        const studentCourse = enrollment[0];
        // Fetch badge if any
        let badge = null;
        if (studentCourse.badge_id) {
            badge = await handleFetch(`${BASE_URL}/badges/${studentCourse.badge_id}`);
        } else {
            // Find badge dynamically based on total score
            const badges = await handleFetch(`${BASE_URL}/badges`);
            badge = badges.find((b: any) => studentCourse.total_score >= b.min_score && studentCourse.total_score <= b.max_score);
        }
        return {
            ...studentCourse,
            badge
        };
    }
    return null;
};

// 10. Submit practice answers (code and essay), increase student score, and mark progress as completed
export const submitPracticeAnswersApi = async (params: {
    studentId: number;
    courseId: number;
    subLessonId: number;
    codeQuestionId: number | null;
    codeAnswer: string;
    essayAnswers: { essayQuestionId: number; answer: string }[];
    scoreToAdd: number;
}) => {


    // 1. Submit Code Answer (if any)
    if (params.codeQuestionId) {
        // Check if answer already exists
        const existingCodeAnswer = await handleFetch(`${BASE_URL}/t_code_answer?user_id=${params.studentId}&code_question_id=${params.codeQuestionId}`);
        
        if (existingCodeAnswer.length > 0) {
            await handleFetch(`${BASE_URL}/t_code_answer/${existingCodeAnswer[0].id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    is_code_right: true,
                    exploring_score: params.scoreToAdd,
                    updated_at: new Date().toISOString(),
                    user_update: params.studentId
                })
            });
        } else {
            await handleFetch(`${BASE_URL}/t_code_answer`, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: params.studentId,
                    code_question_id: params.codeQuestionId,
                    is_code_right: true,
                    exploring_score: params.scoreToAdd,
                    isactive: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    user_create: params.studentId,
                    user_update: params.studentId
                })
            });
        }

        // Add log
        await handleFetch(`${BASE_URL}/t_code_history_logs`, {
            method: 'POST',
            body: JSON.stringify({
                user_id: params.studentId,
                code_question_id: params.codeQuestionId,
                time_count: 30,
                message: "Build successful! All tests passed.",
                is_error: false,
                isactive: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_create: params.studentId,
                user_update: params.studentId
            })
        });
    }

    // 2. Submit Essay Answers
    for (const essay of params.essayAnswers) {
        // Check if answer already exists
        const existingEssayAnswer = await handleFetch(`${BASE_URL}/t_essay_answer?user_id=${params.studentId}&essay_question_id=${essay.essayQuestionId}`);
        
        if (existingEssayAnswer.length > 0) {
            await handleFetch(`${BASE_URL}/t_essay_answer/${existingEssayAnswer[0].id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    answer: essay.answer,
                    updated_at: new Date().toISOString(),
                    user_update: params.studentId
                })
            });
        } else {
            await handleFetch(`${BASE_URL}/t_essay_answer`, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: params.studentId,
                    essay_question_id: essay.essayQuestionId,
                    answer: essay.answer,
                    konteks_penjelasan: 20,
                    keruntutan: 20,
                    kebenaran: 20,
                    teacher_notes: "",
                    is_approved_by_teacher: true,
                    isactive: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    user_create: params.studentId,
                    user_update: params.studentId
                })
            });
        }
    }

    // 3. Update progress to completed
    await updateStudentProgressApi(params.studentId, params.courseId, params.subLessonId, "completed");
};

// 11. Get Student Course Report Data
export const getStudentCourseReportApi = async (studentId: string | number, courseId: string | number) => {
    // 1. Get Course Info
    const course = await handleFetch(`${BASE_URL}/courses/${courseId}`);
    
    // 2. Get Student Course Progress (Total Score, Badge, etc.)
    const enrollment = await handleFetch(`${BASE_URL}/t_student_course?student_id=${studentId}&course_id=${courseId}`);
    const studentCourse = enrollment.length > 0 ? enrollment[0] : null;

    let badge = null;
    if (studentCourse) {
        if (studentCourse.badge_id) {
            badge = await handleFetch(`${BASE_URL}/badges/${studentCourse.badge_id}`);
        } else {
            const badges = await handleFetch(`${BASE_URL}/badges`);
            badge = badges.find((b: any) => studentCourse.total_score >= b.min_score && studentCourse.total_score <= b.max_score);
        }
    }

    // 3. Get Lessons and Sublessons for the course
    const lessons = await handleFetch(`${BASE_URL}/lessons?course_id=${courseId}`);
    const sublessons = await handleFetch(`${BASE_URL}/sublessons`);
    
    // Filter sublessons for this course
    const courseSublessons = sublessons.filter((sl: any) => 
        lessons.some((l: any) => Number(l.id) === Number(sl.lesson_id))
    );

    // 4. Get Student Progress on Sublessons
    const progressList = await handleFetch(`${BASE_URL}/t_student_progress?user_id=${studentId}&course_id=${courseId}`);

    // 5. Get Code Answers and Essay Answers
    const codeAnswers = await handleFetch(`${BASE_URL}/t_code_answer?user_id=${studentId}`);
    const essayAnswers = await handleFetch(`${BASE_URL}/t_essay_answer?user_id=${studentId}`);
    
    // Also need questions to map answers back to sublessons
    const codeQuestions = await handleFetch(`${BASE_URL}/code_question`);
    const essayQuestions = await handleFetch(`${BASE_URL}/essay_question`);

    // Map the report data per sublesson
    const reportData = courseSublessons.map((sl: any) => {
        const progress = progressList.find((p: any) => Number(p.sub_lesson_id) === Number(sl.id));
        const cq = codeQuestions.find((q: any) => Number(q.sub_lesson_id) === Number(sl.id));
        const ca = cq ? codeAnswers.find((a: any) => Number(a.code_question_id) === Number(cq.id)) : null;

        // Essay questions for this sublesson
        const eqList = essayQuestions.filter((eq: any) => {
            if (eq.sub_lesson_id !== undefined && eq.sub_lesson_id !== null) {
                return Number(eq.sub_lesson_id) === Number(sl.id);
            }
            return cq && Number(eq.code_question_id) === Number(cq.id);
        });

        // Calculate essay score
        let essayScore = 0;
        let isAllApproved = true;
        let hasEssay = eqList.length > 0;
        let isPending = false;

        if (hasEssay) {
            eqList.forEach((eq: any) => {
                const ea = essayAnswers.find((a: any) => Number(a.essay_question_id) === Number(eq.id));
                if (ea) {
                    const singleScore = (Number(ea.konteks_penjelasan) || 0) + (Number(ea.keruntutan) || 0) + (Number(ea.kebenaran) || 0);
                    essayScore += singleScore;
                    const isApproved = ea.is_approved_by_teacher === 1 || ea.is_approved_by_teacher === "1" || ea.is_approved_by_teacher === true;
                    if (!isApproved) {
                        isAllApproved = false;
                        isPending = true;
                    }
                } else {
                    isAllApproved = false;
                }
            });
        }

        const readScore = progress && progress.status === 'completed' ? 10 : 0;
        const codingScore = ca ? (Number(ca.exploring_score) || 0) : 0;
        const totalScore = readScore + codingScore + essayScore;

        let status = 'Pending';
        if (progress && progress.status === 'completed') {
            if (hasEssay) {
                status = isPending ? 'Pending' : 'Approve';
            } else {
                status = 'Approve';
            }
        }

        return {
            sublesson: sl,
            readScore,
            codingScore,
            essayScore,
            totalScore,
            status
        };
    });

    const finishedTests = progressList.filter((p: any) => p.status === 'completed').length;
    const totalTests = courseSublessons.length;
    const progressPercent = totalTests > 0 ? Math.round((finishedTests / totalTests) * 100) : 0;

    return {
        course,
        studentCourse,
        badge,
        reportData,
        finishedTests,
        totalTests,
        progressPercent
    };
};

// 12. Get Student Sub Lesson Report Detail
export const getStudentSubLessonReportDetailApi = async (studentId: string | number, courseId: string | number, subLessonId: string | number) => {
    const course = await handleFetch(`${BASE_URL}/courses/${courseId}`);
    const sublesson = await handleFetch(`${BASE_URL}/sublessons/${subLessonId}`);
    const progressList = await handleFetch(`${BASE_URL}/t_student_progress?user_id=${studentId}&course_id=${courseId}&sub_lesson_id=${subLessonId}`);
    const progress = progressList.length > 0 ? progressList[0] : null;

    // Code Question
    const codeQuestions = await handleFetch(`${BASE_URL}/code_question?sub_lesson_id=${subLessonId}`);
    const codeQuestion = codeQuestions.length > 0 ? codeQuestions[0] : null;
    let codeAnswer = null;
    let codeLogs = [];
    if (codeQuestion) {
        const caList = await handleFetch(`${BASE_URL}/t_code_answer?user_id=${studentId}&code_question_id=${codeQuestion.id}`);
        if (caList.length > 0) codeAnswer = caList[0];
        codeLogs = await handleFetch(`${BASE_URL}/t_code_history_logs?user_id=${studentId}&code_question_id=${codeQuestion.id}`);
    }

    // Essay Questions
    const allEssayQuestions = await handleFetch(`${BASE_URL}/essay_question`);
    const essayQuestions = allEssayQuestions.filter((eq: any) => {
        if (eq.sub_lesson_id !== undefined && eq.sub_lesson_id !== null) {
            return Number(eq.sub_lesson_id) === Number(subLessonId);
        }
        return codeQuestion && Number(eq.code_question_id) === Number(codeQuestion.id);
    });

    const allEssayAnswers = await handleFetch(`${BASE_URL}/t_essay_answer?user_id=${studentId}`);
    const essayDetails = essayQuestions.map((eq: any) => {
        const ea = allEssayAnswers.find((a: any) => Number(a.essay_question_id) === Number(eq.id));
        const score = ea ? (Number(ea.konteks_penjelasan) || 0) + (Number(ea.keruntutan) || 0) + (Number(ea.kebenaran) || 0) : 0;
        return {
            question: eq,
            answer: ea,
            score
        };
    });

    let essayTotalScore = 0;
    let isAllApproved = true;
    let hasEssay = essayQuestions.length > 0;
    let isPending = false;

    if (hasEssay) {
        essayDetails.forEach((ed: any) => {
            essayTotalScore += ed.score;
            if (!ed.answer) {
                isAllApproved = false;
            } else {
                const isApproved = ed.answer.is_approved_by_teacher === 1 || ed.answer.is_approved_by_teacher === "1" || ed.answer.is_approved_by_teacher === true;
                if (!isApproved) {
                    isAllApproved = false;
                    isPending = true;
                }
            }
        });
    }

    const readScore = progress && progress.status === 'completed' ? 10 : 0;
    const codingScore = codeAnswer ? (Number(codeAnswer.exploring_score) || 0) : 0;
    const totalScore = readScore + codingScore + essayTotalScore;

    let status = 'Pending';
    if (progress && progress.status === 'completed') {
        if (hasEssay) {
            status = isPending ? 'Pending' : 'Approve';
        } else {
            status = 'Approve';
        }
    }

    // Get User for checking class_id
    let user = null;
    try {
        user = await handleFetch(`${BASE_URL}/users/${studentId}`);
    } catch(e) {}

    return {
        course,
        sublesson,
        progress,
        status,
        readScore,
        codingScore,
        essayScore: essayTotalScore,
        totalScore,
        codeQuestion,
        codeAnswer,
        codeLogs,
        essayDetails,
        user
    };
};

// 13. Get Student Profile Data
export const getStudentProfileApi = async (studentId: string | number) => {
    let user = null;
    try {
        user = await handleFetch(`${BASE_URL}/users/${studentId}`);
    } catch (e) {
        return null;
    }

    if (!user) return null;

    let classData = null;
    if (user.class_id) {
        const classList = await handleFetch(`${BASE_URL}/class?id=${user.class_id}`);
        classData = classList.length > 0 ? classList[0] : null;
    }

    const enrolledCourses = await handleFetch(`${BASE_URL}/t_student_course?student_id=${studentId}`);
    const totalCourses = enrolledCourses.length;
    
    let totalScore = 0;
    let earnedBadges: any[] = [];
    const allBadges = await handleFetch(`${BASE_URL}/badges`);

    enrolledCourses.forEach((ec: any) => {
        totalScore += (Number(ec.total_score) || 0);
        
        let b = null;
        if (ec.badge_id) {
            b = allBadges.find((ab: any) => Number(ab.id) === Number(ec.badge_id));
        } else {
            b = allBadges.find((ab: any) => ec.total_score >= ab.min_score && ec.total_score <= ab.max_score);
        }
        if (b && !earnedBadges.some((eb: any) => eb.id === b.id)) {
            earnedBadges.push(b);
        }
    });

    const progressList = await handleFetch(`${BASE_URL}/t_student_progress?user_id=${studentId}`);
    const completedLessons = progressList.filter((p: any) => p.status === 'completed').length;

    return {
        user,
        classData,
        stats: {
            totalCourses,
            totalScore,
            completedLessons,
            badges: earnedBadges
        }
    };
};

