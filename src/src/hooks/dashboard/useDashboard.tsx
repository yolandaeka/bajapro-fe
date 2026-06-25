import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DashboardApi } from "@/src/actions/dashboard/dashboardApi";
import { DashboardStats, ActivityData, ApprovalItem, ActiveClass } from "@/src/types/dashboard";

export const useDashboard = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [activeClasses, setActiveClasses] = useState<ActiveClass[]>([]);

  const [currentUserRole, setCurrentUserRole] = useState<"Admin" | "Pengajar" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | string | null>(null);

  // Filters for Activity Chart
  const [activityClassId, setActivityClassId] = useState<string>("all");
  const [activityCourseId, setActivityCourseId] = useState<string>("all");
  const [activityStartDate, setActivityStartDate] = useState<string>("");
  const [activityEndDate, setActivityEndDate] = useState<string>("");
  const [availableClasses, setAvailableClasses] = useState<{label: string, value: string}[]>([]);
  const [availableCourses, setAvailableCourses] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setCurrentUserRole(user.role_id == 1 ? "Admin" : "Pengajar");
      setCurrentUserId(user.id);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated" && currentUserRole !== null && currentUserId !== null) {
      fetchDashboardData();
    }
  }, [currentUserRole, currentUserId, status]);

  const fetchDashboardData = async () => {
    if (!currentUserRole || !currentUserId) return;
    setLoading(true);
    try {
      const [statsData, approvalRes, classesRes, classesListRes, coursesListRes] = await Promise.all([
        currentUserRole === "Admin" ? DashboardApi.getAdminStats() : DashboardApi.getPengajarStats(currentUserId as string | number),
        DashboardApi.getPendingApprovals(currentUserRole as "Admin" | "Pengajar"),
        DashboardApi.getActiveClasses(currentUserRole as "Admin" | "Pengajar", currentUserId as string | number),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/class${currentUserRole === 'Pengajar' ? `?teacher_id=${currentUserId}` : ''}`).then(res => res.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/courses`).then(res => res.json())
      ]);

      setStats(statsData);
      setPendingApprovals(approvalRes);
      setActiveClasses(classesRes);
      
      setAvailableClasses([
        { label: "Tanpa Kelas / Umum", value: "none" },
        ...classesListRes.map((c: any) => ({ label: c.class_name, value: String(c.id) }))
      ]);
      setAvailableCourses(coursesListRes.map((c: any) => ({ label: c.course_name, value: String(c.id) })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && currentUserRole !== null && currentUserId !== null) {
      DashboardApi.getActivityData(currentUserRole as "Admin" | "Pengajar", currentUserId as string | number, activityClassId, activityCourseId, activityStartDate, activityEndDate)
        .then(res => setActivityData(res))
        .catch(console.error);
    }
  }, [activityClassId, activityCourseId, activityStartDate, activityEndDate, currentUserRole, currentUserId, status]);

  return {
    loading,
    stats,
    activityData,
    pendingApprovals,
    activeClasses,
    currentUserRole,
    // Filters
    activityClassId, setActivityClassId,
    activityCourseId, setActivityCourseId,
    activityStartDate, setActivityStartDate,
    activityEndDate, setActivityEndDate,
    availableClasses, availableCourses
  };
};
