"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Card,
  Space,
  Typography,
  Segmented,
  Select,
  Empty,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  MenuOutlined,
  SaveOutlined,
  RightOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  SubLessonRecord,
  MaterialRecord,
  SubLessonCreateData,
  LessonRecord,
} from "../types";
import TiptapEditor from "@/src/components/ui/TiptapEditor";
import { fetchMaterialsBySubLessonApi } from "../api/courseApi";

const { Title, Text } = Typography;

interface Props {
  lessons: LessonRecord[];
  initialLessonId: number | null;
  initialData?: SubLessonRecord | null;
  onBack: () => void;
  onSave: (values: SubLessonCreateData, materials: MaterialRecord[]) => void;
  loading: boolean;
}

export const SubLessonForm: React.FC<Props> = ({
  lessons,
  initialLessonId,
  initialData,
  onBack,
  onSave,
  loading,
}) => {
  const [form] = Form.useForm();
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);

  // 1. TAMBAHKAN STATE INI UNTUK MEMPERBAIKI DRAG & DROP NEXT.JS
  const [isMounted, setIsMounted] = useState(false);

  const tempIdCounter = useRef(-1);

  // 1. EFFECT PERTAMA: Khusus untuk mengatasi masalah Hydration Next.js (Dijalankan sekali saja)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Jangan lakukan apa-apa jika komponen belum di-mount di browser
    if (!isMounted) return;

    // Bungkus update sinkronus dengan setTimeout agar tidak terjadi cascading render
    const timeoutId = setTimeout(() => {
      if (initialData) {
        form.setFieldsValue({
          lesson_id: Number(initialData.lesson_id),
          title: initialData.title,
        });
      } else {
        form.resetFields();
        if (initialLessonId)
          form.setFieldValue("lesson_id", Number(initialLessonId));
        setMaterials([]);
      }
    }, 0);

    // Fetch data (Ini aman karena bersifat asynchronous)
    if (initialData && initialData.id) {
      const loadMaterials = async () => {
        try {
          const data = await fetchMaterialsBySubLessonApi(initialData.id);
          const sortedData = (data || []).sort(
            (a, b) => a.content_position - b.content_position,
          );
          setMaterials(sortedData);
        } catch (err) {
          message.error("Gagal memuat detail materi");
        }
      };
      loadMaterials();
    }

    return () => clearTimeout(timeoutId);
  }, [initialData, form, lessons, isMounted]); // <-- Tambahkan isMounted di dependency

  const toggleExpand = (id: number) => {
    setExpandedKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
    );
  };

  const handleAddSection = () => {
    const newId = tempIdCounter.current--;
    const newSection: MaterialRecord = {
      id: newId,
      sub_lesson_id: initialData?.id || 0,
      title: "",
      materials: null,
      url_video: null,
      content_position: materials.length + 1,
      isactive: true,
    };
    setMaterials([...materials, newSection]);
    setExpandedKeys([...expandedKeys, newId]);
  };

  const handleRemoveSection = (id: number) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(materials);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, idx) => ({
      ...item,
      content_position: idx + 1,
    }));

    setMaterials(updatedItems);
  };

  // 2. CEGAH HYDRATION ERROR (YANG BIKIN DND MACET)
  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button
          color="default"
          variant="filled"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
        >
          Kembali
        </Button>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
          >
            Simpan Semua
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(vals) => onSave(vals, materials)}
      >
        <Card className="mb-6 shadow-sm">
          <Form.Item
            label="Pilih Lesson"
            name="lesson_id"
            initialValue={initialLessonId}
            rules={[{ required: true }]}
          >
            <Select
              options={lessons.map((l) => ({
                label: l.title,
                value: Number(l.id),
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Judul Sub Lesson"
            name="title"
            initialValue={initialData?.title}
            rules={[{ required: true }]}
          >
            <Input placeholder="Contoh. Pengenalan Variabel" />
          </Form.Item>
        </Card>

        <div className="flex justify-between items-center mb-4 mt-8">
          <Title level={5}>Konten Materi</Title>
          <Button
            size="middle"
            color="orange"
            variant="solid"
            icon={<PlusOutlined />}
            onClick={handleAddSection}
          >
            Tambah Section
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="materials">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {materials.map((mat, index) => {
                  const isExpanded = expandedKeys.includes(mat.id);

                  return (
                    <Draggable
                      key={String(mat.id)}
                      draggableId={String(mat.id)}
                      index={index}
                    >
                      {(p) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          style={{
                            ...p.draggableProps.style,
                            marginBottom: 16,
                          }}
                        >
                          <Card
                            size="small"
                            title={
                              <Space style={{ margin: "16px 0" }}>
                                <div
                                  {...p.dragHandleProps}
                                  className="cursor-grab text-blue-500"
                                  style={{ marginRight: 8 }}
                                >
                                  <MenuOutlined />
                                </div>
                                <Text strong>
                                  {mat.title || `Section ${index + 1}`}
                                </Text>
                              </Space>
                            }
                            extra={
                              <Space>
                                <Button
                                  type="text"
                                  icon={
                                    isExpanded ? (
                                      <DownOutlined />
                                    ) : (
                                      <UpOutlined />
                                    )
                                  }
                                  onClick={() => toggleExpand(mat.id)}
                                />
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveSection(mat.id)}
                                />
                              </Space>
                            }
                            className="border-l-4 border-l-blue-500"
                            style={{ marginBottom: 16 }}
                          >
                            {isExpanded && (
                              <div style={{ margin: 8 }}>
                                <Input
                                  placeholder="Judul Section"
                                  value={mat.title}
                                  style={{ marginBottom: 16 }}
                                  onChange={(e) => {
                                    const newMats = [...materials];
                                    newMats[index].title = e.target.value;
                                    setMaterials(newMats);
                                  }}
                                />
                                {/* GANTI SEGMENTED MENJADI SELECT */}
                                <div style={{ marginBottom: 16 }}>
                                  <Text
                                    type="secondary"
                                    style={{
                                      marginBottom: 8,
                                    }}
                                  >
                                    Pilih Jenis Konten:
                                  </Text>
                                  <Select
                                    value={
                                      mat.url_video !== null ? "video" : "text"
                                    }
                                    style={{ width: "100%" }} // Agar lebarnya full menyesuaikan form
                                    options={[
                                      {
                                        label: "Video (YouTube)",
                                        value: "video",
                                      },
                                      { label: "Teks (Editor)", value: "text" },
                                    ]}
                                    onChange={(val) => {
                                      const newMats = [...materials];
                                      if (val === "video") {
                                        newMats[index].materials = null;
                                        newMats[index].url_video = "";
                                      } else {
                                        newMats[index].url_video = null;
                                        newMats[index].materials = "";
                                      }
                                      setMaterials(newMats);
                                    }}
                                  />
                                </div>

                                {/* KONDISI UNTUK MENAMPILKAN INPUT URL ATAU TIPTAP EDITOR */}
                                {mat.url_video !== null ? (
                                  <Input
                                    placeholder="URL Video (YouTube)"
                                    value={mat.url_video}
                                    style={{ marginBottom: 16 }}
                                    onChange={(e) => {
                                      const newMats = [...materials];
                                      newMats[index].url_video = e.target.value;
                                      setMaterials(newMats);
                                    }}
                                  />
                                ) : (
                                  <TiptapEditor
                                    value={mat.materials || ""}
                                    onChange={(content) => {
                                      const newMats = [...materials];
                                      newMats[index].materials = content;
                                      setMaterials(newMats);
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                {materials.length === 0 && (
                  <Empty description="Belum ada section materi" />
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Form>
    </div>
  );
};
