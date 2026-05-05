import {
  CodeAnswer,
  EssayAnswer,
  StudentProgress,
  StudentCourse,
  CodeHistoryLog,
} from "../types";

import { UserData } from "@/src/app/(dashboard)/(master)/users/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const USE_REAL_API = true;

// app/report/api/reportApi.tsx

const handleFetch = async (url: string, options?: RequestInit) => {
  if (USE_REAL_API) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        // Tampilkan error yang lebih spesifik di console
        console.error(`Fetch Error: ${response.status} - ${response.statusText} pada URL: ${url}`);
        throw new Error(`Server Error (${response.status}): ${response.statusText}`);
      }
      
      return response.json();
    } catch (err) {
      console.error("Network Error:", err);
      throw err;
    }
  } else {
    return new Promise((resolve) => setTimeout(() => resolve(null), 300));
  }
};

export const reportApi = {
  getClasses: () => handleFetch(`${BASE_URL}/class`),

  getClassesByTeacher: (teacherId: string | number) =>
    handleFetch(`${BASE_URL}/class?teacher_id=${teacherId}`),

  getCourses: () => handleFetch(`${BASE_URL}/courses`),

  getStudentsByClassAndCourse: async (
    classId: string | number,
    courseId: string | number,
  ) => {
    const students = await handleFetch(
      `${BASE_URL}/users?class_id=${classId}&role_id=3`,
    );
    const courses = await handleFetch(
      `${BASE_URL}/t_student_course?course_id=${courseId}`,
    );

    const studentsCourses = students.map((student: UserData) => {
      // PERBAIKAN: Gunakan `==` (loose equality) untuk mencegah error beda tipe (String/Number)
      const matchedCourse = courses.find((course: StudentCourse) => course.user_id == student.id);
      
      return {
        ...student,
        courseId: matchedCourse?.course_id || null,
        totalScore: matchedCourse?.total_score || 0, // <-- MENGAMBIL TOTAL SCORE
      };
    });

    const filteredStudents = studentsCourses.filter(
      (student: UserData & { courseId: string | number | null }) => student.courseId !== null,
    );

    return filteredStudents;
  },

  getStudentProgress: (userId: string | number, courseId: string | number) =>
    handleFetch(`${BASE_URL}/t_student_progress?user_id=${userId}&course_id=${courseId}`),

  getEssayAnswer: (userId: string | number, subLessonId: string | number) =>
    handleFetch(`${BASE_URL}/t_essay_answer?user_id=${userId}&sub_lesson_id=${subLessonId}`),

  getCodeLogs: (userId: string | number, subLessonId: string | number) =>
    handleFetch(`${BASE_URL}/t_code_history_logs?user_id=${userId}&sub_lesson_id=${subLessonId}`),

  updateEssayGrade: (
    essayId: string | number,
    data: {
      konteks_penjelasan: number;
      keruntutan: number;
      kebenaran: number;
      teacher_notes: string;
      is_approved_by_teacher: string;
    },
  ) =>
    handleFetch(`${BASE_URL}/t_essay_answer/${essayId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  updateProgressStatus: (progressId: string | number, status: string) =>
    handleFetch(`${BASE_URL}/t_student_progress/${progressId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
};