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
import { useSession, signOut } from "next-auth/react";

const { Header } = Layout;
const { Text } = Typography;

type BreadcrumbItem = GetProp<BreadcrumbProps, "items">[number];

const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInfo = {
    name: session?.user?.name || (session?.user as any)?.username || (session?.user ? ((session.user as any).role_id == 1 ? "Administrator" : "Pengajar") : ""),
    role: session?.user ? ((session.user as any).role_id == 1 ? "ADMIN" : "PENGAJAR") : ""
  };

  const generateAutoBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    
    const breadcrumbData: { label: React.ReactNode; key: string }[] = [];

    // ATURAN 1: Jika di halaman dashboard, TAMPILKAN tulisan Dashboard
    if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
      return [{ 
        title: (
          <span style={{ color: "#531DAB", fontWeight: 600 }}>
            Dashboard
          </span>
        ), 
        key: "dashboard" 
      }];
    }

    // ATURAN 2: Jika di halaman lain, TIDAK PERLU diawali dengan Dashboard
    // Langsung cari label berdasarkan segmen URL

    // Helper: Mencari label berdasarkan segmen URL (Mengecek Link href)
    const getMenuLabelByPath = (path: string, items: MenuItem[]): { label: React.ReactNode; parent?: string } | null => {
      for (const item of items) {
        const itemHref = (item.label as any)?.props?.href;
        if (itemHref === "/" + path) {
          return { label: item.label };
        }
        if (item.children) {
          const found = getMenuLabelByPath(path, item.children);
          if (found) return { label: found.label, parent: item.label as string };
        }
      }
      return null;
    };

    // Bangun breadcrumb segment demi segment
    segments.forEach((seg) => {
      // Kita abaikan 'dashboard' di sini karena jika ada segmen lain (misal /course), 
      // kita tidak ingin 'dashboard' muncul di depannya sesuai permintaan.
      if (seg === "dashboard") return;

      const menuInfo = getMenuLabelByPath(seg, allMenuItems);
      
      if (menuInfo) {
        if (menuInfo.parent) breadcrumbData.push({ label: menuInfo.parent, key: "p-" + seg });
        breadcrumbData.push({ label: menuInfo.label, key: seg });
      } else {
        let label = seg;
        if (seg === "add") label = "Tambah Baru";
        else if (seg === "edit") label = "Edit Data";
        else if (!isNaN(Number(seg)) || seg.length > 10) label = "Detail";

        breadcrumbData.push({ 
          label: <span style={{ textTransform: "capitalize" }}>{label}</span>, 
          key: seg 
        });
      }
    });

    return breadcrumbData.map((item, index) => {
      const isLast = index === breadcrumbData.length - 1;
      
      // Jika ini item terakhir, kita ingin ambil teks murninya saja 
      // agar tidak terpengaruh warna link default dari Sidebar
      let finalLabel = item.label;
      if (isLast && React.isValidElement(item.label)) {
        // @ts-ignore - Mengambil children dari Link jika label berupa React Element
        finalLabel = item.label.props.children || item.label;
      }

      return {
        key: item.key,
        title: (
          <span
            className="breadcrumb-item"
            style={{
              color: isLast ? "#531DAB" : "#8c8c8c",
              fontWeight: isLast ? 600 : 400,
            }}
          >
            {finalLabel}
          </span>
        ),
      };
    });
  };

  const userMenu: MenuProps["items"] = [
    { 
      key: "profile", 
      icon: <UserOutlined />, 
      label: "Profil Saya",
      onClick: () => {
        window.location.href = "/profile";
      }
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      label: <span style={{ color: "#ff4d4f" }}>Keluar</span>,
      onClick: () => {
        signOut({ callbackUrl: "/login" });
      }
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
              backgroundColor: userInfo.role === "ADMIN" ? "#FAAD14" : "#52C41A",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            {userInfo.name.charAt(0)}
          </Avatar>
          <Text style={{ color: "#531DAB", fontWeight: 600, fontSize: "14px" }}>
            {userInfo.name}
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
