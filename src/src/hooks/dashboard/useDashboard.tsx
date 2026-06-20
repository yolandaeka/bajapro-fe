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

  const [currentUserRole, setCurrentUserRole] = useState<"Admin" | "Pengajar">("Pengajar");
  const [currentUserId, setCurrentUserId] = useState<number | string>(3);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setCurrentUserRole(user.role_id == 1 ? "Admin" : "Pengajar");
      setCurrentUserId(user.id);
    }
  }, [session]);

  useEffect(() => {
    if (status !== "loading") {
      fetchDashboardData();
    }
  }, [currentUserRole, currentUserId, status]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, activityRes, approvalRes, classesRes] = await Promise.all([
        currentUserRole === "Admin" ? DashboardApi.getAdminStats() : DashboardApi.getPengajarStats(currentUserId),
        DashboardApi.getActivityData(currentUserRole),
        DashboardApi.getPendingApprovals(currentUserRole),
        DashboardApi.getActiveClasses(currentUserRole, currentUserId),
      ]);

      setStats(statsData);
      setActivityData(activityRes);
      setPendingApprovals(approvalRes);
      setActiveClasses(classesRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    stats,
    activityData,
    pendingApprovals,
    activeClasses,
    currentUserRole,
  };
};
