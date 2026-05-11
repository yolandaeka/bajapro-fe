import { useState, useEffect } from "react";
import { DashboardApi } from "../api/dashboardApi";
import { DashboardStats, ActivityData, ApprovalItem, ActiveClass } from "../types";

export const useDashboard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [activeClasses, setActiveClasses] = useState<ActiveClass[]>([]);

  const [currentUserRole, setCurrentUserRole] = useState<"Admin" | "Pengajar">("Pengajar");
  const [currentUserId, setCurrentUserId] = useState<number | string>(3);

  useEffect(() => {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1];
      
    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie));
        setCurrentUserRole(user.role_id === 1 ? "Admin" : "Pengajar");
        setCurrentUserId(user.id);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [currentUserRole, currentUserId]);

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
