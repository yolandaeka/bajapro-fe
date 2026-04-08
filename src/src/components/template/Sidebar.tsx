import React, { useState } from "react";
import Image from "next/image";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  BlockOutlined,
  UserOutlined,
  BarChartOutlined,
  BookOutlined,
  AppstoreAddOutlined,
  TeamOutlined,
  SettingOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  DeploymentUnitOutlined,
  BankOutlined
} from "@ant-design/icons";
import { Layout, Menu, ConfigProvider, Button } from "antd";
import type { MenuProps } from "antd";
import Link from "antd/es/typography/Link";
import { usePathname } from "next/navigation";

const { Sider } = Layout;

// ==========================================
// 1. AREA DATA & FUNGSI (DI LUAR KOMPONEN)
// ==========================================

export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  roles?: string[];
  children?: MenuItem[];
}

export const allMenuItems: MenuItem[] = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
    roles: ["ADMIN", "PENGAJAR"],
  },
  {
    key: "g-materi",
    icon: <BookOutlined />,
    label: "Kelola Materi",
    children: [
      {
        key: "level",
        label: <Link href="/dashboard/master/level">Level</Link>,
        icon: <DeploymentUnitOutlined />,
        roles: ["ADMIN"],
      },
      {
        key: "course",
        label: <Link href="/dashboard/master/course">Course</Link>,
        icon: <BlockOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
      },
      {
        key: "question",
        label: <Link href="/dashboard/master/question">Question</Link>,
        icon: <QuestionCircleOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
      },
    ],
  },
  {
    key: "g-pengguna",
    icon: <UserOutlined />,
    label: "Kelola Pengguna",
    children: [
      {
        key: "roles",
        label: <Link href="/dashboard/master/roles">Roles</Link>,
        icon: <SafetyCertificateOutlined />,
        roles: ["ADMIN"],
      },
      {
        key: "kelas",
        label: <Link href="/dashboard/master/kelas">Class</Link>,
        icon: <BankOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
      },
      {
        key: "users",
        label: <Link href="/dashboard/master/users">Users</Link>,
        icon: <TeamOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
      },
      {
        key: "approval",
        label: <Link href="/dashboard/master/approval">Approval</Link>,
        icon: <AppstoreAddOutlined />,
        roles: ["ADMIN"],
      },
      {
        key: "permission",
        label: <Link href="/dashboard/master/permission">Permission</Link>,
        icon: <SettingOutlined />,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    key: "g-report",
    icon: <BarChartOutlined />,
    label: "Report",
    children: [
      {
        key: "report",
        label: <Link href="/dashboard/master/report">Hasil Belajar</Link>,
        icon: <BarChartOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
      },
      {
        key: "leaderboard",
        label: <Link href="/dashboard/master/leaderboard">Leaderboard</Link>,
        icon: <TrophyOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
      },
    ],
  },
  {
    key: "g-gamifikasi",
    icon: <TrophyOutlined />,
    label: "Gamifikasi",
    children: [
      {
        key: "badge",
        label: <Link href="/dashboard/master/badge">Badge Settings</Link>,
        icon: <SettingOutlined />,
        roles: ["ADMIN"],
      },
    ],
  },
];

const getFilteredMenu = (
  menuData: MenuItem[],
  userRole: string,
): MenuItem[] => {
  return menuData
    .filter((item) => !item.roles || item.roles.includes(userRole))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: getFilteredMenu(item.children, userRole),
        };
      }
      return item;
    });
};

// ==========================================
// 2. AREA KOMPONEN UTAMA
// ==========================================

interface SidebarProps {
  role?: "ADMIN" | "PENGAJAR";
}

const Sidebar: React.FC<SidebarProps> = ({ role = "ADMIN" }) => {
 const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const filteredItems = getFilteredMenu(allMenuItems, role);

  // --- FUNGSI OTOMATIS ---
  const getActiveKey = () => {
    
    const pathSegments = pathname.split("/").filter(Boolean); 
    
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (!lastSegment || lastSegment === "dashboard") {
      return "dashboard";
    }
    return lastSegment; 
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemColor: "#595959",
            itemSelectedColor: "#531DAB",
            itemHoverColor: "#531DAB",
            groupTitleColor: "#8C8C8C",
            itemHoverBg: "#EEE8F7",
            itemSelectedBg: "#EEE8F7",
            subMenuItemBg: "transparent",
            fontSize: 14,
          },
        },
        token: {
          colorPrimary: "#531DAB",
        },
      }}
    >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={250}
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
          borderRight: "1px solid #f0f0f0",
        }}
      >
        {/* Wrapper Utama agar Flexbox jalan di dalam Sider */}
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* 1. AREA LOGO (Header Sidebar) */}
          <div
            style={{
              padding: "16px",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              flexShrink: 0, // Biar gak gepeng
            }}
          >
            {!collapsed && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Image
                  src="/assets/logo/logo-sm.png"
                  alt="Logo BAJAPRO"
                  width={32}
                  height={32}
                  priority
                />
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                    lineHeight: "1",
                  }}
                >
                  <span style={{ color: "#531DAB" }}>BAJA</span>
                  <span style={{ color: "#FAAD14" }}>PRO</span>
                </div>
              </div>
            )}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px", color: "#531DAB" }}
            />
          </div>

          {/* 2. AREA MENU (YANG BISA DI-SCROLL) */}
          <div
            style={{
              flex: 1, 
              overflowY: "auto",
              overflowX: "hidden",
              paddingBottom: "100px"
            }}
            className="custom-scrollbar"
          >
            <Menu
              mode="inline"
              selectedKeys={[getActiveKey()]}
              defaultOpenKeys={["g-materi", "g-pengguna", "g-report", "g-gamifikasi"]}
              items={filteredItems as MenuProps["items"]}
            />
          </div>
        </div>
      </Sider>
    </ConfigProvider>
  );
};

export default Sidebar;
