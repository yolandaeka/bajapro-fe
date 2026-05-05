import UserAnswerForm from '../../../components/UserAnswerForm';

export default function DetailAnswerPage({ params }: { params: { classId: string, userId: string, id: string } }) {
  return (
    <div className="p-6">
      <UserAnswerForm userId={params.userId} subLessonId={params.id} />
    </div>
  );
}