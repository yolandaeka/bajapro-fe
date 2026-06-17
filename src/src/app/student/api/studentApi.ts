const BASE_URL = "/api/student";

const handleFetch = async (url: string, options?: RequestInit) => {
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
};

// 1. Get Student Dashboard Data
export const getStudentDashboardApi = async (studentId: string | number) => {
  return await handleFetch(`${BASE_URL}/dashboard?studentId=${studentId}`);
};

// 2. Get All Available Courses
export const getAllCoursesApi = async () => {
  return await handleFetch(`${BASE_URL}/courses`);
};

// 3. Get Course Detail with Levels
export const getCourseDetailApi = async (courseId: string | number) => {
  return await handleFetch(`${BASE_URL}/courses/${courseId}`);
};

// 4. Check if student is enrolled in a course
export const checkEnrollmentApi = async (studentId: string | number, courseId: string | number) => {
  const check = await handleFetch(`${BASE_URL}/enrollment?studentId=${studentId}&courseId=${courseId}`);
  return check !== null;
};

// 5. Enroll Student to Course
export const enrollCourseApi = async (studentId: string | number, courseId: string | number) => {
  return await handleFetch(`${BASE_URL}/enrollment`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, course_id: courseId }),
  });
};

// 6. Get Lessons, Sublessons, Materials, and Questions for Course & Level
export const getCourseMaterialTreeApi = async (courseId: string | number, levelId: string | number) => {
  return await handleFetch(`${BASE_URL}/materials?courseId=${courseId}&levelId=${levelId}`);
};

// 7. Get Student progress for a course
export const getStudentProgressApi = async (studentId: string | number, courseId: string | number) => {
  return await handleFetch(`${BASE_URL}/progress?studentId=${studentId}&courseId=${courseId}`);
};

// 8. Update student progress (create or patch)
export const updateStudentProgressApi = async (
  studentId: string | number,
  courseId: string | number,
  subLessonId: string | number,
  status: string = "completed"
) => {
  return await handleFetch(`${BASE_URL}/progress`, {
    method: "POST",
    body: JSON.stringify({ user_id: studentId, course_id: courseId, sub_lesson_id: subLessonId, status }),
  });
};

// 9. Get student course progress and badge info
export const getStudentCourseProgressApi = async (studentId: string | number, courseId: string | number) => {
  return await handleFetch(`${BASE_URL}/course-progress?studentId=${studentId}&courseId=${courseId}`);
};

// 10. Submit practice answers (code and essay), increase student score, and mark progress as completed
export const submitPracticeAnswersApi = async (params: {
  studentId: number | string;
  courseId: number | string;
  subLessonId: number | string;
  codeQuestionId: number | string | null;
  codeAnswer: string;
  essayAnswers: { essayQuestionId: number | string; answer: string }[];
  scoreToAdd: number;
}) => {
  return await handleFetch(`${BASE_URL}/submit-practice`, {
    method: "POST",
    body: JSON.stringify(params),
  });
};

// 11. Get Student Course Report Data
export const getStudentCourseReportApi = async (studentId: string | number, courseId: string | number) => {
  return await handleFetch(`${BASE_URL}/course-report?studentId=${studentId}&courseId=${courseId}`);
};

// 12. Get Student Sub Lesson Report Detail
export const getStudentSubLessonReportDetailApi = async (
  studentId: string | number,
  courseId: string | number,
  subLessonId: string | number
) => {
  return await handleFetch(`${BASE_URL}/sublesson-report?studentId=${studentId}&courseId=${courseId}&subLessonId=${subLessonId}`);
};

// 13. Get Student Profile Data
export const getStudentProfileApi = async (studentId: string | number) => {
  return await handleFetch(`${BASE_URL}/profile?studentId=${studentId}`);
};
