import UserPorgress from '../../components/UserProgress';

export default async function UserProgressPage({ params }: { params: Promise<{ classId: string, userId: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="p-6">
      <UserPorgress classId={resolvedParams.classId} userId={resolvedParams.userId} />
    </div>
  );
}