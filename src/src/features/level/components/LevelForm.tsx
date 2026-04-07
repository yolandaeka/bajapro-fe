import React from "react";
import { Form, Input, FormInstance } from "antd"; // Tambahkan FormInstance
import { LevelFormData } from "../types"; // Import tipe datanya

const { TextArea } = Input;

interface Props {
  formInstance: FormInstance;
  onFinish: (values: LevelFormData) => void;
}

export const LevelForm: React.FC<Props> = ({ formInstance, onFinish }) => {
  return (
    <Form form={formInstance} layout="vertical" onFinish={onFinish} requiredMark={false}>
      <Form.Item 
        name="levelName" 
        label={<span>Nama Level <span style={{ color: "red" }}>*</span></span>}
        rules={[{ required: true, message: "Nama level wajib diisi!" }]}
      >
        <Input size="large" placeholder="Type here" style={{ borderRadius: "8px" }} />
      </Form.Item>

      <Form.Item 
        name="description" 
        label={<span>Deskripsi <span style={{ color: "red" }}>*</span></span>}
        rules={[{ required: true, message: "Deskripsi wajib diisi!" }]}
      >
        <TextArea rows={5} size="large" placeholder="Type here" style={{ borderRadius: "8px" }} />
      </Form.Item>
    </Form>
  );
};