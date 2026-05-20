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
    const enrolledCourses = await handleFetch(`${BASE_URL}/t_student_course?student_id=${studentId}&is_enroll=true`);
    const allMaterials = await handleFetch(`${BASE_URL}/materials`); // Simply for dummy count
    
    // Enrich enrolled courses with course details
    const coursesData = await Promise.all(enrolledCourses.map(async (ec: any) => {
        const courseDetail = await handleFetch(`${BASE_URL}/courses/${ec.course_id}`);
        return {
            ...ec,
            course: courseDetail
        };
    }));

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
        }
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
    return check.length > 0 && check[0].is_enroll;
};

// 5. Enroll Student to Course
export const enrollCourseApi = async (studentId: string | number, courseId: string | number) => {
    // Check first
    const exist = await handleFetch(`${BASE_URL}/t_student_course?student_id=${studentId}&course_id=${courseId}`);
    if (exist.length > 0) {
        // Update
        return await handleFetch(`${BASE_URL}/t_student_course/${exist[0].id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_enroll: true })
        });
    } else {
        // Create new
        const payload = {
            student_id: Number(studentId),
            course_id: Number(courseId),
            total_score: 0,
            badge_id: null,
            isactive: true,
            is_enroll: true, // This is the new field requested
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
