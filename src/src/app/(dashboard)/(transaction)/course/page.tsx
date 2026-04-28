import ListCourse  from "./components/CourseTable";
import { fetchCoursesApi } from "./api/courseApi"; // Pastikan fungsi ini bisa jalan di server

export default async function CoursePage() {
  
  const courses = await fetchCoursesApi();

  return (
    <div>
      <ListCourse initialData={courses} />
    </div>
  );
}