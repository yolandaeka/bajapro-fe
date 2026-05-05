import QuestionForm from "../components/QuestionForm";

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  // const currentId = Number(id);

  return (
    <div>
      <QuestionForm questionId={id} />
    </div>
  );
}