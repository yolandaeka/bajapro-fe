"use client";

import React, { useState } from "react";
import { Card, Select, Button, Typography, Empty, Space, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { SubLessonForm } from "./SubLessonForm";
import { LessonRecord, SubLessonRecord, ReorderItem, MaterialRecord, SubLessonCreateData, MaterialsCreateData } from "../types";

const { Text } = Typography;

interface Props {
  lessons: LessonRecord[];
  subLessons: SubLessonRecord[];
  selectedLessonId: number | null;
  onSelectLesson: (id: number) => void;
  onSaveAll: (subLesson: SubLessonCreateData, materials: MaterialRecord[], editId?: number) => void;
  onDeleteSub: (id: number) => void;
  onReorderSub: (updates: ReorderItem[]) => void;
  loading: boolean;
}

export const SubLessonListTab: React.FC<Props> = ({
  lessons, subLessons, selectedLessonId, onSelectLesson, onSaveAll, onDeleteSub, onReorderSub, loading
}) => {
  const [view, setView] = useState<"list" | "form">("list");
  const [editingData, setEditingData] = useState<SubLessonRecord | null>(null);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(subLessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      id: item.id,
      newPosition: index + 1
    }));
    onReorderSub(updates);
  };

  if (view === "form") {
    return (
     <SubLessonForm
        lessons={lessons}
        initialLessonId={selectedLessonId}
        initialData={editingData}
        onBack={() => { setEditingData(null); setView("list"); }}
        onSave={(vals, mats) => { 
          // PERBAIKAN: Tambahkan editingData?.id sebagai parameter ketiga!
          onSaveAll(vals, mats, editingData?.id); 
          setView("list"); 
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="">
      <Card>
        <Space orientation="vertical" className="w-full">
          <Text strong>Pilih Lesson:</Text>
          <Select
            className="w-full"
            placeholder="Pilih Lesson"
            options={lessons.map(l => ({ label: l.title, value: l.id }))}
            value={selectedLessonId}
            onChange={(val) => onSelectLesson(val)}
          />
          <Button 
            style={{marginTop: 4}}
            type="primary" 
            size="medium"
            icon={<PlusOutlined />} 
            disabled={!selectedLessonId}
            onClick={() => { setEditingData(null); setView("form"); }}
          >
            Tambah Sub Lesson
          </Button>
        </Space>
      </Card>
      <div style={{marginTop: 16}}>
      <Card title="Urutan Materi Sub Lesson">
        {!selectedLessonId ? (
          <Empty description="Pilih Lesson terlebih dahulu" />
        ) : (
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="sublesson-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {subLessons.map((sub, index) => (
                    <Draggable key={sub.id} draggableId={String(sub.id)} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center justify-between p-4 bg-white border-1 border-black-300 rounded-lg shadow-sm"
                        >
                          <Space>
                            <div {...provided.dragHandleProps} className="cursor-grab text-gray-400">
                              <MenuOutlined />
                            </div>
                            <Text strong>{sub.title}</Text>
                          </Space>
                          <Space>
                            <Button icon={<EditOutlined />} onClick={() => { setEditingData(sub); setView("form"); }} />
                            <Button danger icon={<DeleteOutlined />} onClick={() => onDeleteSub(sub.id)} />
                          </Space>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Card>
      </div>
    </div>
  );
};