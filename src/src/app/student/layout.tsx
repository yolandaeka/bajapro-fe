"use client";

import React from "react";
import { Layout } from "antd";
import StudentNavbar from "@/src/components/navigation/StudentNavbar";
import StudentFooter from "@/src/components/navigation/StudentFooter";

const { Content } = Layout;

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: "100vh", background: "#FAFAFA" }}>
      <StudentNavbar />
      <Content
        style={{
          width: "100%",
          maxWidth: "1440px",
          margin: "36px auto",
          padding: "0 36px",
          flex: 1,
        }}
      >
        {children}
      </Content>
      <StudentFooter />
    </Layout>
  );
}
