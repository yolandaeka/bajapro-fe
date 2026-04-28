import React from "react";
import {
  Layout,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Breadcrumb,
  GetProp,
  BreadcrumbProps,
} from "antd";
import type { MenuProps } from "antd";
import { usePathname } from "next/navigation";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { allMenuItems, MenuItem } from "./Sidebar";

const { Header } = Layout;
const { Text } = Typography;

type BreadcrumbItem = GetProp<BreadcrumbProps, "items">[number];

const Navbar = () => {
  const pathname = usePathname();

  const generateAutoBreadcrumbs = (): BreadcrumbItem[] => {
    // 1. Ambil nama halaman dari URL paling ujung (misal: 'badge' atau 'role')
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment || lastSegment === "dashboard") return [];

    const breadcrumbData: { label: React.ReactNode }[] = [];

    // 2. FUNGSI PINTAR: Mencari Anak sekaligus Bapaknya
    const findPath = (
      items: MenuItem[],
      targetKey: string,
      parents: MenuItem[] = [],
    ): boolean => {
      for (const item of items) {
        // Cek apakah key cocok (kita abaikan g- atau d- agar fleksibel)
        const cleanKey = item.key.replace(/^[gd]-/, "");

        if (cleanKey === targetKey || item.key === targetKey) {
          // Ketemu! Masukkan semua bapaknya dulu, baru dirinya sendiri
          parents.forEach((p) => breadcrumbData.push({ label: p.label }));
          breadcrumbData.push({ label: item.label });
          return true;
        }

        if (item.children) {
          // Cari ke dalam anak-anaknya, sambil bawa info "siapa bapaknya"
          if (findPath(item.children, targetKey, [...parents, item]))
            return true;
        }
      }
      return false;
    };

    findPath(allMenuItems, lastSegment);

    return breadcrumbData.map((item, index) => {
      const isLast = index === breadcrumbData.length - 1;

      return {
        title: (
          <span
            className="breadcrumb-item" // Tambahkan class agar mudah ditarget
            style={{
              color: isLast ? "#531DAB" : "#8c8c8c",
              fontWeight: isLast ? 600 : 400,
              cursor: isLast ? "default" : "pointer",
            }}
          >
            {}
            <span style={{ color: "inherit", display: "inline-block" }}>
              {item.label}
            </span>

            {/* Tambahkan CSS kecil khusus untuk Link di dalam Breadcrumb ini */}
            <style jsx global>{`
              .breadcrumb-item a {
                color: inherit !important;
                font-weight: inherit !important;
                text-decoration: none;
              }
              .breadcrumb-item a:hover {
                color: #531dab !important; /* Warna ungu saat di-hover agar interaktif */
              }
            `}</style>
          </span>
        ),
      };
    });
  };

  const userMenu: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: "Profil Saya" },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      label: <span style={{ color: "#ff4d4f" }}>Keluar</span>,
    },
  ];

  return (
    <Header
      style={{
        padding: "0 32px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        height: "72px",
      }}
    >
      <Breadcrumb
        items={generateAutoBreadcrumbs()}
        separator={<span style={{ color: "#bfbfbf" }}>/</span>}
        style={{ fontSize: "15px" }}
      />

      <Dropdown
        menu={{ items: userMenu }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <Space style={{ cursor: "pointer", gap: "8px" }}>
          <Avatar
            style={{
              backgroundColor: "#FAAD14",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            A
          </Avatar>
          <Text style={{ color: "#531DAB", fontWeight: 600, fontSize: "14px" }}>
            Admin
          </Text>
          <DownOutlined
            style={{ fontSize: "12px", color: "#531DAB", marginLeft: "4px" }}
          />
        </Space>
      </Dropdown>
    </Header>
  );
};

export default Navbar;
