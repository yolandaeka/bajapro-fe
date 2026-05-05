import ClassTable from "../components/ClassTable";

export default function ClassListPage({ params }: { params: { classId: string } }) {
  return (
    <div className="p-6">
      <ClassTable classId={params.classId} />
    </div>
  );
}