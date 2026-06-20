"use client";

import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Collapse,
  Space,
  InputNumber,
  Card,
  Row,
  Col,
  App,
} from "antd";
import { useQuestion } from "@/src/hooks/code_question/useQuestion";
import { getQuestionDetailApi } from "@/src/actions/code_question/questionApi";
import { CodeFormData } from "@/src/types/code_question";
import TiptapEditor from "@/src/components/ui/TiptapEditor";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

interface QuestionFormProps {
  questionId?: number | string;
}

const TiptapEditorWrapper = React.forwardRef<
  HTMLDivElement,
  { value?: string; onChange?: (val: string) => void }
>(({ value = "", onChange }, _ref) => (
  <TiptapEditor value={value} onChange={(v: string) => onChange?.(v)} />
));
TiptapEditorWrapper.displayName = "TiptapEditorWrapper";

const QuestionFormInner: React.FC<QuestionFormProps> = ({ questionId }) => {
  const [form] = Form.useForm();
  const router = useRouter();

  // SEMUA DATA ditarik langsung dari Hook!
  const {
    loading,
    handleSaveQuestion,
    courses,
    lessons,
    subLessons,
    loadCourses,
    loadLessons,
    loadSubLessons,
    clearSubLessons,
  } = useQuestion();

  // Load awal Course
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Logika Set Data Edit & Create
  useEffect(() => {
    if (questionId) {
      getQuestionDetailApi(questionId).then(async (data) => {
        setTimeout(() => {
          form.setFieldsValue(data);
        }, 0);

        if (data.course_id) await loadLessons(data.course_id);

        if (data.lesson_id) await loadSubLessons(data.lesson_id);

        setTimeout(() => {
          form.setFieldsValue({
            ...data,
            course_id: data.course_id ? String(data.course_id) : undefined,
            lesson_id: data.lesson_id ? String(data.lesson_id) : undefined,
            sub_lesson_id: data.sub_lesson_id
              ? String(data.sub_lesson_id)
              : undefined,
          });
        }, 0);
        console.log("Data soal berhasil dimuat untuk edit:", data);
      });
    } else {
      setTimeout(() => {
        form.setFieldsValue({ essays: [{}, {}, {}] });
      }, 0);
    }
  }, [questionId, form, loadLessons, loadSubLessons]);

  // Handler UI: Kosongkan field form, lalu suruh Hook ambil data baru
  const onCourseChange = (val: number) => {
    form.setFieldsValue({ lesson_id: undefined, sub_lesson_id: undefined });
    clearSubLessons();
    loadLessons(val);
  };

  const onLessonChange = (val: number | string) => {
    form.setFieldsValue({ sub_lesson_id: undefined });
    loadSubLessons(val);
  };

  const onFinish = (values: CodeFormData) => {
    handleSaveQuestion(values, questionId);
  };

  const { can, loading: authLoading } = useAuth();
  const isEdit = !!questionId;
  const canSave = isEdit ? can("question.update") : can("question.create");
  const isViewOnly = !canSave;

  return (
    <div className="p-4">
      {/* CSS untuk membuat teks disabled tetap hitam pekat */}
      <style>{`
        .ant-input-disabled, 
        .ant-select-disabled .ant-select-selection-item,
        .ant-input-number-disabled input {
          color: rgba(0, 0, 0, 0.85) !important;
          background-color: #f5f5f5 !important;
        }
      `}</style>
      
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
      >
        {/* HEADER: Selalu aktif agar tombol Kembali bisa diklik */}
        <div
          className="flex justify-between items-center mb-6"
          style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <Button
            color="default"
            variant="filled"
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/code_question")}
          >
            Kembali
          </Button>
          <Space>
            {canSave && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="large"
                htmlType="submit"
                loading={loading}
              >
                Simpan
              </Button>
            )}
          </Space>
        </div>

        {/* KONTEN: Baru di-disable di sini jika tidak punya izin simpan */}
        <div style={{ pointerEvents: !canSave ? "none" : "auto", opacity: 1 }}>
          <fieldset disabled={!canSave} style={{ border: "none", padding: 0, margin: 0 }}>

      <Card
        title="Pengaturan Soal"
        style={{
          borderRadius: 16,
          border: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Course"
              name="course_id"
              rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
            >
              {isViewOnly ? (
                <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                  {courses.find((c) => String(c.value) === String(form.getFieldValue("course_id")))?.label || form.getFieldValue("course_id") || "-"}
                </div>
              ) : (
                <Select
                  style={{ width: "100%" }}
                  options={courses}
                  onChange={onCourseChange}
                  placeholder="Pilih Course"
                />
              )}
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Lesson"
              name="lesson_id"
              rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
            >
              {isViewOnly ? (
                <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                  {lessons.find((c) => String(c.value) === String(form.getFieldValue("lesson_id")))?.label || form.getFieldValue("lesson_id") || "-"}
                </div>
              ) : (
                <Select
                  style={{ width: "100%" }}
                  options={lessons}
                  onChange={onLessonChange}
                  placeholder="Pilih Lesson"
                />
              )}
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Sub Lesson"
              name="sub_lesson_id"
              rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
            >
              {isViewOnly ? (
                <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                  {subLessons.find((c) => String(c.value) === String(form.getFieldValue("sub_lesson_id")))?.label || form.getFieldValue("sub_lesson_id") || "-"}
                </div>
              ) : (
                <Select
                  style={{ width: "100%" }}
                  options={subLessons}
                  placeholder="Pilih Sub Lesson"
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          borderRadius: 16,
          border: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          marginTop: 24,
        }}
        title="Code Question"
      >
        <Form.Item
          label="Soal Utama (Code Question)"
          name="code_question"
          rules={[{ required: !isViewOnly, message: "Soal wajib diisi" }]}
        >
          {isViewOnly ? (
            <div 
              className="p-4 bg-gray-50 border border-gray-200 rounded min-h-[100px]"
              dangerouslySetInnerHTML={{ __html: form.getFieldValue("code_question") || "-" }} 
            />
          ) : (
            <TiptapEditorWrapper />
          )}
        </Form.Item>
        <Form.Item
          label="Exploring Score"
          name="score"
          rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
        >
          {isViewOnly ? (
            <div className="p-2 bg-gray-50 border border-gray-200 rounded">{form.getFieldValue("score") || "-"}</div>
          ) : (
            <InputNumber min={0} max={100} style={{ display: "block" }} />
          )}
        </Form.Item>
      </Card>

      <Card
        style={{
          borderRadius: 16,
          border: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          marginTop: 24,
        }}
        title="Essay Question"
      >
        <Form.List name="essays">
          {(fields) => {
            return (
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card key={key} title={`Soal Essay ${index + 1}`} type="inner" style={{ marginBottom: 16 }}>
                    <Form.Item {...restField} name={[name, "id"]} hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Pertanyaan Essay"
                      name={[name, "question"]}
                      rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
                    >
                      {isViewOnly ? (
                        <div 
                          className="p-4 bg-gray-50 border border-gray-200 rounded min-h-[100px]"
                          dangerouslySetInnerHTML={{ __html: form.getFieldValue(["essays", index, "question"]) || "-" }} 
                        />
                      ) : (
                        <TiptapEditorWrapper />
                      )}
                    </Form.Item>

                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Form.Item
                        {...restField}
                        label="Jawaban Utama"
                        name={[name, "answer"]}
                        rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
                      >
                        {isViewOnly ? (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            {form.getFieldValue(["essays", index, "answer"]) || "-"}
                          </div>
                        ) : (
                          <Input.TextArea rows={2} placeholder="Masukkan teks jawaban yang benar" />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Jawaban 1"
                        name={[name, "answer_1"]}
                        rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
                      >
                        {isViewOnly ? (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            {form.getFieldValue(["essays", index, "answer_1"]) || "-"}
                          </div>
                        ) : (
                          <Input.TextArea rows={2} />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Jawaban 2"
                        name={[name, "answer_2"]}
                        rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
                      >
                        {isViewOnly ? (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            {form.getFieldValue(["essays", index, "answer_2"]) || "-"}
                          </div>
                        ) : (
                          <Input.TextArea rows={2} />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Jawaban 3"
                        name={[name, "answer_3"]}
                        rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
                      >
                        {isViewOnly ? (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            {form.getFieldValue(["essays", index, "answer_3"]) || "-"}
                          </div>
                        ) : (
                          <Input.TextArea rows={2} />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Jawaban 4"
                        name={[name, "answer_4"]}
                        rules={[{ required: !isViewOnly, message: "Wajib diisi" }]}
                      >
                        {isViewOnly ? (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            {form.getFieldValue(["essays", index, "answer_4"]) || "-"}
                          </div>
                        ) : (
                          <Input.TextArea rows={2} />
                        )}
                      </Form.Item>
                    </Space>
                  </Card>
                ))}
              </Space>
            );
          }}
        </Form.List>
      </Card>
        </fieldset>
      </div>
    </Form>
    </div>
  );
};

const QuestionForm: React.FC<QuestionFormProps> = (props) => (
  <App>
    <QuestionFormInner {...props} />
  </App>
);

export default QuestionForm;
