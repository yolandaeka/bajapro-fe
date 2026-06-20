import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LeaderboardApi } from "@/src/actions/leaderboard/leaderboardApi";
import { CourseRecord, ClassRecord } from "@/src/types/leaderboard";

export const useLeaderboard = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [studentsRank, setStudentsRank] = useState<any[]>([]);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState<string | number | null>(null);
  const [rankingType, setRankingType] = useState<"global" | "class">("global");
  const [selectedClass, setSelectedClass] = useState<string | number | null>(null);

  const [currentUserRole, setCurrentUserRole] = useState<"Admin" | "Pengajar">("Pengajar");
  const [currentUserId, setCurrentUserId] = useState<number | string>(3);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setCurrentUserRole(user.role_id === 1 ? "Admin" : "Pengajar");
      setCurrentUserId(user.id);
    }
  }, [session]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await LeaderboardApi.getCourses();
      setCourses(res);
      if (res && res.length > 0) {
        setSelectedCourse(res[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchClasses();
      fetchRanking();
    }
  }, [selectedCourse, rankingType, selectedClass]);

  const fetchClasses = async () => {
    try {
      if (currentUserRole === "Admin") {
        const res = await LeaderboardApi.getClasses();
        setClasses(res);
      } else {
        // Pengajar hanya lihat kelas yang diajar
        const res = await LeaderboardApi.getClassesByTeacher(currentUserId);
        setClasses(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRanking = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      let classFilter = null;
      if (rankingType === "class") {
        if (!selectedClass) {
          setStudentsRank([]); // if class is not selected, don't show any rank yet or show empty
          setLoading(false);
          return;
        }
        classFilter = selectedClass;
      }
      
      const data = await LeaderboardApi.getStudentsRanking(selectedCourse, classFilter);
      setStudentsRank(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    courses,
    classes,
    studentsRank,
    selectedCourse,
    setSelectedCourse,
    rankingType,
    setRankingType,
    selectedClass,
    setSelectedClass,
    currentUserRole
  };
};
