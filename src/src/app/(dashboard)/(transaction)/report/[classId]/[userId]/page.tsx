import UserPorgress from '../../components/UserProgress';

export default function UserProgressPage({ params }: { params: { classId: string, userId: string } }) {
  return (
    <div className="p-6">
      <UserPorgress classId={params.classId} userId={params.userId} />
    </div>
  );
}