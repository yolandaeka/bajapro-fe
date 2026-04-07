"use client";

import React, { useState } from "react";
import {
  Card, Modal, Form, Input, Select, Typography,
  Button, Space, Popover
} from "antd";
import { PlusOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useUser } from "@/src/features/users/hooks/useUsers";
import { UserData } from "@/src/features/users/types";

// 👇 Import komponen tabel yang baru dibuat
import { UserTable } from "@/src/features/users/components/UsersTable";

const { Title } = Typography;

export default function UserPage() {
  const { users, loading, addUser, editUser, deleteUser, contextHolder } = useUser();
  const [form] = Form.useForm();
  const selectedFormRole = Form.useWatch("role", form);

  const currentUserRole: string = "Admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterInstansi, setFilterInstansi] = useState<string | null>(null);
  const [filterKelas, setFilterKelas] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredUsers = users.filter((user) => {
    let match = true;
    if (searchText && !user.name.toLowerCase().includes(searchText.toLowerCase())) match = false;
    if (filterRole && user.role !== filterRole) match = false;
    if (filterInstansi && user.instansi !== filterInstansi) match = false;
    if (filterKelas && user.kelas !== filterKelas) match = false;
    return match;
  });

  const handleAction = (action: "add" | "edit" | "view", record?: UserData) => {
    setModalMode(action);
    setSelectedId(record?.id || null);
    setIsModalOpen(true);
    if (action === "add") form.resetFields();
    else if (record) setTimeout(() => form.setFieldsValue(record), 50);
  };

  const handleSimpan = async () => {
    try {
      const values = await form.validateFields();
      let success = false;
      if (modalMode === "add") success = await addUser(values);
      else if (modalMode === "edit" && selectedId) success = await editUser(selectedId, values);
      if (success) setIsModalOpen(false);
    } catch (error) {
      console.log("Validasi form gagal", error);
    }
  };

  const filterContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "220px" }}>
      {currentUserRole === "Admin" && (
        <>
          <div>
            <Typography.Text strong>Role</Typography.Text>
            <Select style={{ width: "100%", marginTop: "4px" }} placeholder="Semua Role" allowClear value={filterRole} onChange={setFilterRole} options={[{ label: "Admin", value: "Admin" }, { label: "Pengajar", value: "Pengajar" }, { label: "Pelajar", value: "Pelajar" }]} />
          </div>
          <div>
            <Typography.Text strong>Instansi</Typography.Text>
            <Select style={{ width: "100%", marginTop: "4px" }} placeholder="Semua Instansi" allowClear value={filterInstansi} onChange={setFilterInstansi} options={[{ label: "Polinema", value: "Polinema" }, { label: "SMAN 1 Malang", value: "SMAN 1 Malang" }]} />
          </div>
        </>
      )}
      {currentUserRole === "Pengajar" && (
        <div>
          <Typography.Text strong>Kelas</Typography.Text>
          <Select style={{ width: "100%", marginTop: "4px" }} placeholder="Semua Kelas" allowClear value={filterKelas} onChange={setFilterKelas} options={[{ label: "10 IPA 1", value: "10 IPA 1" }, { label: "11 IPS 2", value: "11 IPS 2" }, { label: "12 Bahasa", value: "12 Bahasa" }]} />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <Button type="primary" style={{ backgroundColor: "#7246BA", borderRadius: "6px" }} onClick={() => setIsFilterOpen(false)}>Tutup</Button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Card style={{ borderRadius: "12px", padding: "12px" }}>
        <Title level={3} style={{ marginBottom: "4px" }}>List User</Title>
        <p style={{ color: "gray", marginTop: "0px", marginBottom: "24px" }}>Kelola pengguna dan profilnya</p>

        {/* TOOLBAR */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <Button type="primary" icon={<PlusOutlined />} size="large" style={{ backgroundColor: "#7246BA", borderRadius: "8px" }} onClick={() => handleAction("add")}>
            Tambah User
          </Button>
          <Space>
            <Input size="large" placeholder="Cari Nama" prefix={<SearchOutlined />} style={{ borderRadius: "8px", width: "250px" }} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <Popover content={filterContent} title="Filter Data" trigger="click" open={isFilterOpen} onOpenChange={setIsFilterOpen} placement="bottomRight">
              <Button size="large" icon={<FilterOutlined />} style={{ borderRadius: "8px" }}>Filter</Button>
            </Popover>
          </Space>
        </div>

        {/* 👇 Panggil komponen tabel di sini */}
        <UserTable 
          data={filteredUsers} 
          loading={loading} 
          currentUserRole={currentUserRole}
          onAction={handleAction} 
          onDelete={deleteUser} 
        />
      </Card>

      {/* MODAL FORM */}
      <Modal
        title={<span style={{ color: "#7246BA", fontSize: "20px", fontWeight: "bold" }}>{modalMode === "add" ? "Tambah User" : modalMode === "edit" ? "Edit User" : "Detail User"}</span>}
        open={isModalOpen} onCancel={() => setIsModalOpen(false)} width={600}
        footer={modalMode === "view" ? <Button size="large" onClick={() => setIsModalOpen(false)}>Tutup</Button> : <Button size="large" type="primary" style={{ backgroundColor: "#7246BA" }} onClick={handleSimpan} loading={loading}>Simpan</Button>}
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }} disabled={modalMode === "view"}>
          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item label="Nama User" name="name" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="Type here" size="large" />
            </Form.Item>
            <Form.Item label="Role" name="role" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Select placeholder="Pilih Role" size="large" options={[{ label: "Admin", value: "Admin" }, { label: "Pengajar", value: "Pengajar" }, { label: "Pelajar", value: "Pelajar" }]} />
            </Form.Item>
          </div>
          {selectedFormRole === "Pengajar" && (
            <Form.Item label="Nama Instansi/Sekolah" name="instansi" rules={[{ required: true }]}>
              <Input placeholder="Misal: Polinema" size="large" />
            </Form.Item>
          )}
          {selectedFormRole === "Pelajar" && (
            <Form.Item label="Kelas" name="kelas" rules={[{ required: true }]}>
              <Select placeholder="Pilih Kelas" size="large" options={[{ label: "10 IPA 1", value: "10 IPA 1" }, { label: "11 IPS 2", value: "11 IPS 2" }, { label: "12 Bahasa", value: "12 Bahasa" }]} />
            </Form.Item>
          )}
          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item label="Email" name="email" style={{ flex: 1 }} rules={[{ required: true, type: "email" }]}>
              <Input placeholder="Type here" size="large" />
            </Form.Item>
            {modalMode !== "view" && (
              <Form.Item label="Password" name="password" style={{ flex: 1 }} rules={[{ required: modalMode === "add" }]}>
                <Input.Password placeholder="Type here" size="large" />
              </Form.Item>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
}