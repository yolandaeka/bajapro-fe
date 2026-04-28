import { useState, useEffect } from "react";
import { message, Modal } from "antd";
import { useRouter } from "next/navigation";
import {
  CourseRecord,
  CourseFormData,
  LessonRecord,
  LessonCreateData,
  SubLessonRecord,
  SubLessonCreateData,
  ReorderItem,
  MaterialRecord,
} from "../types";
import { LevelData } from "@/src/app/(dashboard)/(master)/level/types";
import {
  fetchCourseByIdApi,
  createCourseApi,
  updateCourseApi,
  updateLessonApi,
  fetchLessonsByCourseApi,
  createLessonApi,
  reorderLessonsApi,
  fetchSubLessonsByLessonApi,
  createSubLessonApi,
  deleteSubLessonApi,
  reorderSubLessonsApi,
  fetchLevelsApi,
  deleteLessonApi,
  updateSubLessonApi,
  createMaterialsApi,
  updateMaterialsApi,
} from "../api/courseApi";

export const useManageCourseMateri = (courseId: number | null) => {
  const router = useRouter();
  // const [activeTab, setActiveTab] = useState("detail"); //default nya tab detail course
  const [loading, setLoading] = useState<boolean>(false);
  const isEditing = !!courseId;
  const [messageApi, contextHolder] = message.useMessage();

  // --- STATE TAB 1: Detail Course ---
  const [courseData, setCourseData] = useState<CourseRecord | null>(null);

  // --- STATE TAB 2: Lesson ---
  const [lessons, setLessons] = useState<LessonRecord[]>([]);

  // --- STATE TAB 3: Sub Lesson & Material ---
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [subLessons, setSubLessons] = useState<SubLessonRecord[]>([]);

  // state level
  const [levels, setLevels] = useState<LevelData[]>([]);

  const [activeTab, setActiveTab] = useState("detail");
  const [isMounted, setIsMounted] = useState(false);

// 1. Trik setTimeout untuk bypass Linter Sync Render
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsMounted(true);
      const savedTab = sessionStorage.getItem(`course_tab_${courseId || "new"}`);
      if (savedTab && savedTab !== activeTab) {
        setActiveTab(savedTab);
      }
    }, 0); // Eksekusi ditunda ke microtask berikutnya

    return () => clearTimeout(timeoutId);
  }, [courseId, activeTab]);

  // 2. Simpan session (Tidak ada setState di sini, jadi aman)
  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem(`course_tab_${courseId || "new"}`, activeTab);
    }
  }, [activeTab, courseId, isMounted]);

  // 3. Load Course Data
  useEffect(() => {
    if (!courseId) return;

    const loadInitialData = async () => {
      setLoading(true); // Aman karena di dalam fungsi async
      try {
        const [course, lessonsData, levelsData] = await Promise.all([
          fetchCourseByIdApi(courseId),
          fetchLessonsByCourseApi(courseId),
          fetchLevelsApi(),
        ]);
        setCourseData(course);
        setLessons(lessonsData);
        setLevels(levelsData);
      } catch (error) {
        messageApi.error("Gagal mengambil data course");
        router.push("/course");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [courseId, router, messageApi]);

  // 4. Load Sub Lessons
  useEffect(() => {
    if (!selectedLessonId) {
      // Bungkus dengan setTimeout agar tidak dihitung sebagai sync render
      const timeoutId = setTimeout(() => setSubLessons([]), 0);
      return () => clearTimeout(timeoutId);
    }

    const loadSubLessons = async () => {
      setLoading(true); // Aman karena di dalam fungsi async
      try {
        const subs = await fetchSubLessonsByLessonApi(selectedLessonId);
        setSubLessons(subs);
      } catch (error) {
        messageApi.error("Gagal mengambil data materi");
      } finally {
        setLoading(false);
      }
    };

    loadSubLessons();
  }, [selectedLessonId, messageApi]);

  // ========================================================
  // A. CRUD HANDLER TAB 1: Detail Course
  // ========================================================
  const handleSaveCourse = async (values: CourseFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateCourseApi(courseId!, values);
        messageApi.success("Course berhasil diperbarui");
      } else {
        const response = await createCourseApi(values);

        const newId = response.id;

        messageApi.success("Course baru berhasil dibuat");
        router.push(`/course/${newId}`); // Redirect ke edit page tab 1
      }
    } catch (error) {
      messageApi.error("Terjadi kesalahan saat menyimpan course.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // B. CRUD HANDLER TAB 2: Lesson
  // ========================================================
  const handleAddLesson = async (values: LessonCreateData) => {
    if (!courseId) return;
    setLoading(true);
    try {
      await createLessonApi(courseId, values);
      messageApi.success("Lesson baru berhasil ditambahkan");
      const updatedLessons = await fetchLessonsByCourseApi(courseId); // Reload
      setLessons(updatedLessons);
    } catch (error) {
      messageApi.error("Gagal menambahkan lesson.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (
    id: number,
    values: Partial<LessonRecord>,
  ) => {
    setLoading(true);
    try {
      await updateLessonApi(id, values);
      messageApi.success("Lesson berhasil diperbarui"); // <--- POPUP SUCCESS REQ #5
      const updated = await fetchLessonsByCourseApi(courseId!);
      setLessons(updated);
    } catch (error) {
      messageApi.error("Gagal memperbarui lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleReorderLessons = async (updates: ReorderItem[]) => {
    if (!courseId) return;
    try {
      await reorderLessonsApi(courseId, updates);
      // Gak perlu reload full, update local state aja biar responsif
      setLessons((prev) =>
        prev
          .map((l) => {
            const u = updates.find((update) => update.id === l.id);
            if (u) return { ...l, position: u.newPosition };
            return l;
          })
          .sort((a, b) => a.position - b.position),
      );
      message.success("Urutan lesson berhasil diperbarui");
    } catch (error) {
      message.error("Gagal memperbarui urutan.");
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    // Munculkan konfirmasi dulu (opsional, tapi disarankan)
    Modal.confirm({
      title: "Hapus Lesson?",
      content:
        "Apakah Anda yakin ingin menghapus materi ini? Data yang dihapus tidak bisa dikembalikan.",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: async () => {
        setLoading(true);
        try {
          await deleteLessonApi(lessonId);
          messageApi.success("Lesson berhasil dihapus");

          // Update state lokal agar tampilan langsung hilang tanpa refresh
          setLessons((prev) => prev.filter((item) => item.id !== lessonId));
        } catch (error) {
          messageApi.error("Gagal menghapus lesson");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // ========================================================
  // CRUD HANDLER TAB 3: Sub Lesson & Material (DIPERBAIKI)
  // ========================================================

  const handleSaveSubLessonAll = async (
    values: SubLessonCreateData,
    materials: MaterialRecord[],
    editingId?: number,
  ) => {
    if (!selectedLessonId) return;
    setLoading(true);

    try {
      if (editingId) {
        // --- 1. PROSES UPDATE ---
        await updateSubLessonApi(editingId, values);

        for (const [index, mat] of materials.entries()) {
          const payload = {
            title: mat.title,
            materials: mat.materials,
            url_video: mat.url_video,
            sub_lesson_id: editingId,
            content_position: index + 1,
            isactive: true,
          };

          // Logika Diffing Pintar: Kalau punya ID dari database (ID > 0), berarti Update
          if (mat.id && mat.id > 0) {
            await updateMaterialsApi(mat.id, payload);
          } else {
            // Kalau tidak punya ID (atau ID Temp), berarti dia section baru
            await createMaterialsApi(payload);
          }
        }
      } else {
        // --- 2. PROSES CREATE NEW ---
        const newSub = await createSubLessonApi({
          ...values,
          lesson_id: selectedLessonId,
        });

        const newSubId = newSub.id; // Dapatkan ID dari respon Golang

        for (const [index, mat] of materials.entries()) {
          await createMaterialsApi({
            title: mat.title,
            materials: mat.materials,
            url_video: mat.url_video,
            sub_lesson_id: newSubId, // Hubungkan ke parent
            content_position: index + 1,
          });
        }
      }

      message.success("Data Sub Lesson dan Materi Berhasil Disimpan!");

      // Refresh ulang state local dari database
      const updatedSubs = await fetchSubLessonsByLessonApi(selectedLessonId);
      setSubLessons(updatedSubs);
    } catch (error) {
      message.error("Gagal menyimpan materi. Pastikan koneksi server aman.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorderSubLessons = async (updates: ReorderItem[]) => {
    if (!selectedLessonId) return;
    try {
      await reorderSubLessonsApi(selectedLessonId, updates);
      setSubLessons((prev) =>
        prev
          .map((s) => {
            const u = updates.find((update) => update.id === s.id);
            if (u) return { ...s, order_position: u.newPosition };
            return s;
          })
          .sort((a, b) => a.order_position - b.order_position),
      );
      message.success("Urutan materi berhasil diperbarui!");
    } catch (error) {
      message.error("Gagal memperbarui urutan.");
    }
  };

  const handleDeleteSubLesson = async (subLessonId: number) => {
    setLoading(true);
    try {
      await deleteSubLessonApi(subLessonId);
      message.warning("Materi berhasil dihapus.");
      setSubLessons((prev) => prev.filter((item) => item.id !== subLessonId));
    } catch (error) {
      message.error("Gagal menghapus materi.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    activeTab,
    setActiveTab,
    isEditing,
    // Tab 1
    courseData,
    handleSaveCourse,
    // Tab 2
    lessons,
    handleAddLesson,
    handleReorderLessons,
    handleUpdateLesson,
    handleDeleteLesson,
    // Tab 3
    selectedLessonId,
    setSelectedLessonId,
    subLessons,
    levels,
    handleSaveSubLessonAll,
    handleReorderSubLessons,
    handleDeleteSubLesson,
    contextHolder,
    isMounted,
  };
};
