import React from "react";
import { Layout, Avatar, Dropdown, Space, Typography, MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";

const { Header } = Layout;
const { Text } = Typography;

const StudentNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = React.useState<{ name: string; role: string }>({ name: "User", role: "Pelajar" });

  React.useEffect(() => {
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1];
    if (userCookie) {
      try {
        const decoded = decodeURIComponent(userCookie).replace(/^"|"$/g, '');
        const user = JSON.parse(decoded);
        setUserInfo({
          name: user.name || "Pelajar",
          role: "Pelajar"
        });
      } catch (e) {}
    } else {
        const lsUser = localStorage.getItem("user");
        if(lsUser) {
            try{
                const u = JSON.parse(lsUser);
                setUserInfo({
                    name: u.name || "Pelajar",
                    role: "Pelajar"
                });
            } catch(e){}
        }
    }
  }, []);

  const userMenu: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: "Profil Saya" },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      label: <span style={{ color: "#ff4d4f" }}>Keluar</span>,
      onClick: () => {
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    },
  ];

  const navLinks = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "Course", path: "/student/course" },
    { name: "Leaderboard", path: "/student/leaderboard" },
  ];

  return (
    <Header
      style={{
        padding: "0 64px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        height: "72px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => router.push("/student/dashboard")}>
        <div style={{ fontWeight: 800, fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#531DAB" }}>BAJA</span><span style={{ color: "#FADB14" }}>PRO</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ display: "flex", gap: "32px" }}>
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.path);
          return (
            <Link key={link.name} href={link.path}>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#531DAB" : "#bfbfbf",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* User Menu */}
      <Dropdown
        menu={{ items: userMenu }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <Space style={{ cursor: "pointer", gap: "12px" }}>
          <Avatar
            style={{
              backgroundColor: "#FAAD14",
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
            style={{ fontSize: "12px", color: "#531DAB" }}
          />
        </Space>
      </Dropdown>
    </Header>
  );
};

export default StudentNavbar;
