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
    return await handleFetch(`${BASE_URL}/courses`);
};

// 3. Get Course Detail with Levels
export const getCourseDetailApi = async (courseId: string | number) => {
    const course = await handleFetch(`${BASE_URL}/courses/${courseId}`);
    const levels = await handleFetch(`${BASE_URL}/levels`);
    const lessons = await handleFetch(`${BASE_URL}/lessons?course_id=${courseId}`);
    
    // Group lessons by level
    const levelsWithStats = levels.map((lvl: any) => {
        const lvlLessons = lessons.filter((l: any) => Number(l.level_id) === Number(lvl.id));
        return {
            ...lvl,
            lessonCount: lvlLessons.length,
            subLessonCount: lvlLessons.length * 5, // dummy
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
