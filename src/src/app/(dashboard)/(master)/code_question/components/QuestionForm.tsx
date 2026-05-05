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
import { useQuestion } from "../hooks/useQuestion";
import { getQuestionDetailApi } from "../api/questionApi";
import { CodeFormData } from "../types";
import TiptapEditor from "@/src/components/ui/TiptapEditor";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

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
        form.setFieldsValue(data);

        if (data.course_id) await loadLessons(data.course_id);

        if (data.lesson_id) await loadSubLessons(data.lesson_id);

        form.setFieldsValue({
          ...data,
          course_id: data.course_id ? String(data.course_id) : undefined,
          lesson_id: data.lesson_id ? String(data.lesson_id) : undefined,
          sub_lesson_id: data.sub_lesson_id
            ? String(data.sub_lesson_id)
            : undefined,
        });
        console.log("Data soal berhasil dimuat untuk edit:", data);
      });
    } else {
      form.setFieldsValue({ essays: [{}, {}, {}] });
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

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
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
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            htmlType="submit"
            loading={loading}
          >
            Simpan
          </Button>
        </Space>
      </div>
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
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <Select
                style={{ width: "100%" }}
                options={courses}
                onChange={onCourseChange}
                placeholder="Pilih Course"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Lesson"
              name="lesson_id"
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <Select
                style={{ width: "100%" }}
                options={lessons}
                onChange={onLessonChange}
                placeholder="Pilih Lesson"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Sub Lesson"
              name="sub_lesson_id"
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <Select
                style={{ width: "100%" }}
                options={subLessons}
                placeholder="Pilih Sub Lesson"
              />
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
          rules={[{ required: true, message: "Soal wajib diisi" }]}
        >
          <TiptapEditorWrapper />
        </Form.Item>
        <Form.Item
          label="Exploring Score"
          name="score"
          rules={[{ required: true, message: "Wajib diisi" }]}
        >
          <InputNumber min={0} max={100} style={{ display: "block" }} />
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
            const collapseItems = fields.map(
              ({ key, name, ...restField }, index) => ({
                key: String(key),
                label: `Soal Essay ${index + 1}`,
                children: (
                  <>
                    <Form.Item {...restField} name={[name, "id"]} hidden>
                      <Input />
                    </Form.Item>

                    {/* ✅ Essay question juga pakai TiptapEditorWrapper */}
                    <Form.Item
                      {...restField}
                      label="Pertanyaan Essay"
                      name={[name, "question"]}
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <TiptapEditorWrapper />
                    </Form.Item>

                    <Space orientation="vertical" style={{ width: "100%" }}>
                      <Form.Item
                        {...restField}
                        label="Jawaban Utama"
                        name={[name, "answer"]}
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="Masukkan teks jawaban yang benar"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Jawaban 1"
                        name={[name, "answer_1"]}
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Jawaban 2"
                        name={[name, "answer_2"]}
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Jawaban 3"
                        name={[name, "answer_3"]}
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Jawaban 4"
                        name={[name, "answer_4"]}
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    </Space>
                  </>
                ),
              }),
            );

            return <Collapse defaultActiveKey={["0"]} items={collapseItems} />;
          }}
        </Form.List>
      </Card>
    </Form>
  );
};

const QuestionForm: React.FC<QuestionFormProps> = (props) => (
  <App>
    <QuestionFormInner {...props} />
  </App>
);

export default QuestionForm;
