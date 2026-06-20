"use client";

import React, { useState, useEffect } from "react";
import { Card, Avatar, Typography, Row, Col, Descriptions, Spin, Button, Modal, Form, Input, message } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
import { useSession } from "next-auth/react";

export default function ProfileManager() {
  const { data: session, status, update } = useSession();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setUserInfo({
        ...user,
        roleName: user.role_id === 1 ? "Administrator" : "Pengajar",
        name: user.name || user.username || (user.role_id === 1 ? "Administrator" : "Pengajar"),
      });
    }
  }, [session]);

  const handleUpdateProfile = async (values: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/users/${userInfo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role_id: userInfo.role_id })
      });
      if (!response.ok) throw new Error("Gagal mengupdate profil");
      
      const updatedData = await response.json();
      
      // Update cookie user (mocking, since the actual cookie is set on login)
      const newUser = { ...userInfo, ...values };
      await update({
        ...session,
        user: {
          ...session?.user,
          name: values.name,
          email: values.email,
          instansi_sekolah: values.instansi_sekolah
        }
      });
      
      setUserInfo(newUser);
      message.success("Profil berhasil diupdate!");
      setIsEditModalOpen(false);
    } catch (error) {
      message.error("Terjadi kesalahan saat mengupdate profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Text type="danger">Data profil tidak ditemukan. Silakan login kembali.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ borderRadius: "12px", overflow: "hidden" }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} md={6} style={{ textAlign: "center" }}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{
                backgroundColor: userInfo.role_id === 1 ? "#FAAD14" : "#52C41A",
                color: "#fff",
                fontSize: "48px",
              }}
            >
              {userInfo.name.charAt(0).toUpperCase()}
            </Avatar>
            <Title level={3} style={{ marginTop: "16px", marginBottom: "4px" }}>
              {userInfo.name}
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              {userInfo.roleName}
            </Text>
          </Col>

          <Col xs={24} sm={16} md={18}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <Title level={4} style={{ margin: 0 }}>Informasi Pengguna</Title>
              <Button type="primary" onClick={() => {
                form.setFieldsValue({
                  name: userInfo.name,
                  email: userInfo.email,
                  instansi_sekolah: userInfo.school_name || userInfo.instansi_sekolah
                });
                setIsEditModalOpen(true);
              }}>Edit Profil</Button>
            </div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID Pengguna">
                {userInfo.id}
              </Descriptions.Item>
              <Descriptions.Item label="Nama Lengkap">
                {userInfo.name}
              </Descriptions.Item>
              {userInfo.username && (
                <Descriptions.Item label="Username">
                  {userInfo.username}
                </Descriptions.Item>
              )}
              {userInfo.email && (
                <Descriptions.Item label="Email">
                  {userInfo.email}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Peran">
                {userInfo.roleName}
              </Descriptions.Item>
              {userInfo.school_name && (
                <Descriptions.Item label="Sekolah / Instansi">
                  {userInfo.school_name}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Edit Profil"
        open={isEditModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsEditModalOpen(false)}
        confirmLoading={isSubmitting}
        forceRender={true}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item name="name" label="Nama Lengkap" rules={[{ required: true, message: 'Masukkan nama lengkap' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Masukkan email yang valid' }]}>
            <Input />
          </Form.Item>
          {userInfo.role_id === 2 && (
            <Form.Item name="instansi_sekolah" label="Sekolah / Instansi">
              <Input />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
