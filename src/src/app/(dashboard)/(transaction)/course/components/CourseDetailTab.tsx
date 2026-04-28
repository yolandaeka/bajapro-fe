"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, message, Image } from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { CourseRecord, CourseFormData } from "../types";

const { TextArea } = Input;

interface CourseDetailProps {
  initialData: CourseRecord | null;
  onSave: (values: CourseFormData) => Promise<void>;
  loading: boolean;
}

export const CourseDetailTab: React.FC<CourseDetailProps> = ({
  initialData,
  onSave,
  loading
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [previewImage, setPreviewImage] = useState<string>(
    initialData?.img_thumbnail || ""
  );

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        course_name: initialData.course_name,
        description: initialData.description,
      });
    }
  }, [initialData, form]);


  const handleBeforeUpload = (file: RcFile) => {
    const isAllowedType = ["image/png", "image/jpeg", "image/jpg"].includes(file.type);
    if (!isAllowedType) {
      messageApi.error("Hanya bisa upload file PNG/JPG/JPEG!");
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error("Ukuran gambar maksimal 2MB!");
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };

    return false;
  };

  const onFinish = async (values: CourseFormData) => {
    const payload = {
      ...values,
      img_thumbnail: previewImage, 
    };
    await onSave(payload); 
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={loading}
        size="large"
      >
        <Form.Item
          label="Nama Course"
          name="course_name"
          rules={[{ required: true, message: "Nama course wajib diisi!" }]}
        >
          <Input placeholder="Contoh: Java Basic 1" />
        </Form.Item>

        <Form.Item
          label="Deskripsi"
          name="description"
          rules={[{ required: true, message: "Deskripsi wajib diisi!" }]}
        >
          <TextArea placeholder="Tuliskan deskripsi..." rows={4} />
        </Form.Item>

        <Form.Item label="Course Thumbnail">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
            
            {/* BOX PREVIEW GAMBAR */}
            {previewImage && (
              <Image
                src={previewImage}
                alt="Preview"
                style={{ width: 300, height: 300, objectFit: "cover", borderRadius: 8, border: "1px solid #d9d9d9" }}
              />
            )}

            {/* TOMBOL UPLOAD & HAPUS */}
            <div style={{ display: "flex", gap: "8px" }}>
              <Upload
                accept=".png,.jpg,.jpeg"
                showUploadList={false}
                beforeUpload={handleBeforeUpload}
              >
                <Button icon={<UploadOutlined />} size="medium">Pilih Gambar</Button>
              </Upload>

              {/* Tombol Hapus: Cukup kosongkan state previewImage */}
              {previewImage && (
                <Button 
                  danger 
                  type="default"
                  size="medium" 
                  onClick={() => setPreviewImage("")}
                >
                  Hapus
                </Button>
              )}
            </div>
          </div>
        </Form.Item>

        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading} 
          icon={<SaveOutlined />}
        >
          Simpan
        </Button>
      </Form>
    </>
  );
};