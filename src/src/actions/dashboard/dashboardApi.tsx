import { DashboardStats, ActivityData, ApprovalItem, ActiveClass } from "@/src/types/dashboard";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return process.env.NEXT_PUBLIC_API_URL || "/api";
  if (process.env.VERCEL_URL) return "https://" + process.env.VERCEL_URL + "/api";
  return "http://localhost:3000/api";
};
const BASE_URL = getBaseUrl();

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
      console.error(`Fetch Error: ${response.status}`);
      throw new Error(`Server Error (${response.status})`);
    }
    return response.json();
  } catch (err) {
    console.error("Network Error:", err);
    throw err;
  }
};

export const DashboardApi = {
  getAdminStats: async (): Promise<DashboardStats> => {
    const users = await handleFetch(`${BASE_URL}/users`);
    const classes = await handleFetch(`${BASE_URL}/class`);
    
    const teachers = users.filter((u: any) => u.role_id == 2);
    const students = users.filter((u: any) => u.role_id == 3);
    const pendingTeachers = teachers.filter((t: any) => t.is_approved_by_admin == 0);

    return {
      pendingApproval: pendingTeachers.length,
      totalClasses: classes.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
    };
  },

  getPengajarStats: async (teacherId: string | number): Promise<DashboardStats> => {
    const classes = await handleFetch(`${BASE_URL}/class?teacher_id=${teacherId}`);
    const classIds = classes.map((c: any) => c.id);
    const users = await handleFetch(`${BASE_URL}/users?role_id=3`);
    const myStudents = users.filter((u: any) => classIds.includes(u.class_id));
    
    const essayAnswers = await handleFetch(`${BASE_URL}/t_essay_answer`);
    const pendingTasks = essayAnswers.filter((a: any) => a.is_approved_by_teacher === "pending" || a.is_approved_by_teacher === false);
    const approvedTasks = essayAnswers.filter((a: any) => a.is_approved_by_teacher === "true" || a.is_approved_by_teacher === true);

    return {
      pendingApproval: pendingTasks.length,
      totalClasses: classes.length,
      totalStudents: myStudents.length,
      approvedItems: approvedTasks.length,
    };
  },

  getActivityData: async (role: "Admin" | "Pengajar"): Promise<ActivityData[]> => {
    if (role === "Admin") {
      return [
        { day: "Mon", count: 65 },
        { day: "Tue", count: 85 },
        { day: "Wed", count: 70 },
        { day: "Thu", count: 90 },
        { day: "Fri", count: 50 },
        { day: "Sat", count: 80 },
        { day: "Sun", count: 95 },
      ];
    } else {
      return [
        { day: "Mon", count: 12 },
        { day: "Tue", count: 18 },
        { day: "Wed", count: 15 },
        { day: "Thu", count: 25 },
        { day: "Fri", count: 10 },
        { day: "Sat", count: 5 },
        { day: "Sun", count: 8 },
      ];
    }
  },

  getPendingApprovals: async (role: "Admin" | "Pengajar"): Promise<ApprovalItem[]> => {
    if (role === "Admin") {
      const users = await handleFetch(`${BASE_URL}/users?role_id=2`);
      const pendingTeachers = users.filter((t: any) => t.is_approved_by_admin === 0);
      return pendingTeachers.slice(0, 5).map((t: any) => ({
        id: t.id,
        name: t.name,
        context: t.instansi_sekolah || "Unknown School",
      }));
    } else {
      const essayAnswers = await handleFetch(`${BASE_URL}/t_essay_answer`);
      const users = await handleFetch(`${BASE_URL}/users`);
      const pendingTasks = essayAnswers.filter((a: any) => a.is_approved_by_teacher === "pending" || a.is_approved_by_teacher === false);
      
      return pendingTasks.slice(0, 5).map((task: any) => {
        const student = users.find((u: any) => u.id == task.user_id);
        return {
          id: task.id,
          name: student?.name || "Unknown Student",
          context: `Tugas Essay #${task.essay_question_id}`,
        };
      });
    }
  },

  getActiveClasses: async (role: "Admin" | "Pengajar", teacherId?: string | number): Promise<ActiveClass[]> => {
    let classes = await handleFetch(`${BASE_URL}/class`);
    if (role === "Pengajar" && teacherId) {
      classes = classes.filter((c: any) => c.teacher_id == teacherId);
    }
    const users = await handleFetch(`${BASE_URL}/users`);
    
    const courses = await handleFetch(`${BASE_URL}/courses`);
    const studentCourses = await handleFetch(`${BASE_URL}/t_student_course`);

    const activeClasses: ActiveClass[] = [];
    
    classes.forEach((c: any, index: number) => {
      const teacher = users.find((u: any) => u.id == c.teacher_id);
      const studentsInClass = users.filter((u: any) => u.class_id == c.id);
      const studentIds = studentsInClass.map((u: any) => u.id);
      
      if (studentsInClass.length === 0) {
        activeClasses.push({
          id: c.id,
          no: activeClasses.length + 1,
          className: c.class_name,
          teacherName: teacher?.name || "Unknown",
          studentCount: 0,
          progress: 0,
          status: c.isactive ? "Aktif" : "Non-Aktif",
          courseName: "Belum Ada Course",
        } as any);
        return;
      }

      const classStudentCourses = studentCourses.filter((sc: any) => studentIds.includes(sc.student_id));
      const courseIdsInClass = Array.from(new Set(classStudentCourses.map((sc: any) => sc.course_id)));
      
      if (courseIdsInClass.length === 0) {
        activeClasses.push({
          id: c.id,
          no: activeClasses.length + 1,
          className: c.class_name,
          teacherName: teacher?.name || "Unknown",
          studentCount: studentsInClass.length,
          progress: 0,
          status: c.isactive ? "Aktif" : "Non-Aktif",
          courseName: "Belum Ada Course",
        } as any);
        return;
      }

      courseIdsInClass.forEach((courseId) => {
        const course = courses.find((crs: any) => crs.id == courseId);
        const courseName = course ? course.course_name : "Unknown Course";
        
        const studentsInThisCourse = classStudentCourses.filter((sc: any) => sc.course_id == courseId);
        let totalScore = 0;
        studentsInThisCourse.forEach((sc: any) => {
          totalScore += sc.total_score || 0;
        });
        
        const maxScorePerStudent = 100;
        let avgProgress = studentsInThisCourse.length > 0 ? Math.min(100, Math.floor((totalScore / (studentsInThisCourse.length * maxScorePerStudent)) * 100)) : 0;
        
        activeClasses.push({
          id: `${c.id}-${courseId}`,
          no: activeClasses.length + 1,
          className: c.class_name,
          teacherName: teacher?.name || "Unknown",
          studentCount: studentsInThisCourse.length,
          progress: avgProgress,
          status: c.isactive ? "Aktif" : "Non-Aktif",
          courseName: courseName,
        } as any);
      });
    });

    return activeClasses;
  }
};
