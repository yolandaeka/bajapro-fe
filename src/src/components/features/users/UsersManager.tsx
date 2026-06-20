"use client";

import React, { useState } from "react";
import {
  Card,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Button,
  Space,
  Popover,
  Descriptions,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useUser } from "@/src/hooks/users/useUsers";
import { UserData } from "@/src/types/users";
import { UserTable } from "@/src/components/features/users/UsersTable";

import { useSession } from "next-auth/react";

const { Title } = Typography;

export default function UsersManager() {
  const {
    users,
    loading,
    addUser,
    editUser,
    deleteUser,
    contextHolder,
    roleOptions,
    instansiOptions,
    kelasOptions,
  } = useUser();
  
  const [form] = Form.useForm();
  const selectedFormRole = Form.useWatch("role", form);

  // --- CONFIG USER ---
  const { data: session } = useSession();
  const [currentUserRole, setCurrentUserRole] = useState<string>("Admin");
  const [currentUserId, setCurrentUserId] = useState<string | number>("p1");

  React.useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setCurrentUserRole(user.role_id === 1 ? "Admin" : "Pengajar");
      setCurrentUserId(user.id);
    }
  }, [session]);

  // --- STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [viewData, setViewData] = useState<UserData | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterInstansi, setFilterInstansi] = useState<string | null>(null);
  const [filterKelas, setFilterKelas] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- LOGIKA FILTERING ---
  const filteredUsers = users.filter((u) => {
    // 1. Role Pengajar: Hanya lihat muridnya sendiri
    if (currentUserRole === "Pengajar") {
      if (u.role !== "Student") return false;
      if (u.id !== currentUserId) return false; 
    }

    // 2. Search Text
    if (searchText && !u.name.toLowerCase().includes(searchText.toLowerCase())) return false;

    // 3. Filter Dropdown
    if (filterRole && u.role !== filterRole) return false;
    if (filterInstansi && u.instansi_sekolah !== filterInstansi) return false;
    if (filterKelas && u.class_name !== filterKelas) return false;

    return true;
  }); // 👈 Sekarang sudah tertutup dengan benar

  // --- HANDLERS ---
  const handleAction = (action: "add" | "edit" | "view", record?: UserData) => {
    setModalMode(action);
    setSelectedId(record?.id || null);
    setIsModalOpen(true);

    if (action === "view" && record) {
      setViewData(record);
    } else {
      setViewData(null);
      if (action === "add") {
        form.resetFields();
        if (currentUserRole === "Pengajar") {
          setTimeout(() => form.setFieldsValue({ role: "Pelajar" }), 50);
        }
      } else if (record) {
        setTimeout(() => form.setFieldsValue(record), 50);
      }
    }
  };

  const handleSimpan = async () => {
    try {
      const values = await form.validateFields();
      let success = false;
      if (modalMode === "add") success = await addUser(values);
      else if (modalMode === "edit" && selectedId)
        success = await editUser(selectedId.toString(), values);
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
            <Select
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="Semua Role"
              allowClear
              value={filterRole}
              onChange={setFilterRole}
              options={roleOptions}
            />
          </div>
          <div>
            <Typography.Text strong>Instansi</Typography.Text>
            <Select
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="Semua Instansi"
              allowClear
              value={filterInstansi}
              onChange={setFilterInstansi}
              options={instansiOptions}
            />
          </div>
        </>
      )}
      
      {currentUserRole === "Pengajar" && (
        <div>
          <Typography.Text strong>Kelas</Typography.Text>
          <Select
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="Semua Kelas"
            allowClear
            value={filterKelas}
            onChange={setFilterKelas}
            options={kelasOptions}
          />
        </div>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", flexWrap: "wrap", gap: "8px" }}>
        <Button type="dashed" onClick={() => {
            setFilterRole(null);
            setFilterInstansi(null);
            setFilterKelas(null);
        }}>Reset</Button>
        <Button
          type="primary"
          style={{ backgroundColor: "#7246BA", borderRadius: "6px" }}
          onClick={() => setIsFilterOpen(false)}
        >
          Terapkan
        </Button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Card style={{ borderRadius: "12px", padding: "12px" }}>
        <Title level={3} style={{ marginBottom: "4px" }}>List User</Title>
        <p style={{ color: "gray", marginTop: "0px", marginBottom: "24px" }}>
          Kelola pengguna dan profilnya
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ backgroundColor: "#7246BA", borderRadius: "8px" }}
            onClick={() => handleAction("add")}
          >
            Tambah User
          </Button>
          <Space>
            <Input
              size="large"
              placeholder="Cari Nama"
              prefix={<SearchOutlined />}
              style={{ borderRadius: "8px", width: "250px" }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Popover
              content={filterContent}
              title="Filter Data"
              trigger="click"
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
              placement="bottomRight"
            >
              <Button size="large" icon={<FilterOutlined />} style={{ borderRadius: "8px" }}>
                Filter
              </Button>
            </Popover>
          </Space>
        </div>

        <UserTable
          data={filteredUsers}
          loading={loading}
          currentUserRole={currentUserRole}
          onAction={handleAction}
          onDelete={deleteUser}
        />
      </Card>

      <Modal
        title={
          <span style={{ color: "#7246BA", fontSize: "20px", fontWeight: "bold" }}>
            {modalMode === "add" ? "Tambah User" : modalMode === "edit" ? "Edit User" : "Detail User"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        footer={
          modalMode === "view" ? (
            <Button size="large" onClick={() => setIsModalOpen(false)}>Tutup</Button>
          ) : (
            <Button size="large" type="primary" style={{ backgroundColor: "#7246BA" }} onClick={handleSimpan} loading={loading}>
              Simpan
            </Button>
          )
        }
      >
        {modalMode === "view" ? (
          viewData ? (
            <Descriptions column={1} bordered style={{ marginTop: "24px" }}>
              <Descriptions.Item label="Nama User"><strong>{viewData.name}</strong></Descriptions.Item>
              <Descriptions.Item label="Role">{viewData.role}</Descriptions.Item>
              <Descriptions.Item label="Email">{viewData.email}</Descriptions.Item>
              {viewData.role === "Pengajar" && (
                <Descriptions.Item label="Instansi">{viewData.instansi_sekolah || "-"}</Descriptions.Item>
              )}
              {viewData.role === "Pelajar" && (
                <Descriptions.Item label="Kelas">{viewData.class_name || "-"}</Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <p>Memuat data...</p>
          )
        ) : (
          <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <Form.Item label="Nama User" name="name" style={{ flex: 1 }} rules={[{ required: true }]}>
                <Input placeholder="Type here" size="large" />
              </Form.Item>
              <Form.Item label="Role" name="role" style={{ flex: 1 }} rules={[{ required: true }]}>
                <Select 
                  placeholder="Pilih Role" 
                  size="large" 
                  options={currentUserRole === "Pengajar" ? [{ label: "Pelajar", value: "Pelajar" }] : roleOptions} 
                  disabled={currentUserRole === "Pengajar"}
                />
              </Form.Item>
            </div>
            
            {selectedFormRole === "Pengajar" && (
              <Form.Item label="Nama Instansi/Sekolah" name="instansi_sekolah" rules={[{ required: true }]}>
                <Select placeholder="Pilih Instansi" size="large" options={instansiOptions} />
              </Form.Item>
            )}
            
            {selectedFormRole === "Pelajar" && (
              <Form.Item label="Kelas" name="class_name" rules={[{ required: true }]}>
                <Select placeholder="Pilih Kelas" size="large" options={kelasOptions} />
              </Form.Item>
            )}
            
            <div style={{ display: "flex", gap: "16px" }}>
              <Form.Item label="Email" name="email" style={{ flex: 1 }} rules={[{ required: true, type: "email" }]}>
                <Input placeholder="Type here" size="large" />
              </Form.Item>
              {modalMode === "add" && (
                <Form.Item label="Password" name="password" style={{ flex: 1 }} rules={[{ required: true }]}>
                  <Input.Password placeholder="Type here" size="large" />
                </Form.Item>
              )}
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
}

