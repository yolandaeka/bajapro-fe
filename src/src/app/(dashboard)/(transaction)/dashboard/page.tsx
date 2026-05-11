"use client";

import React from "react";
import { Typography, Row, Col } from "antd";
import { useDashboard } from "./hooks/useDashboard";
import { StatCards } from "./components/StatCards";
import { ActivityChart } from "./components/ActivityChart";
import { ApprovalList } from "./components/ApprovalList";
import { ActiveClassesTable } from "./components/ActiveClassesTable";

const { Title } = Typography;

export default function DashboardPage() {
  const {
    loading,
    stats,
    activityData,
    pendingApprovals,
    activeClasses,
    currentUserRole
  } = useDashboard();

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        {/* The top bar (Navbar) in your design shows "Dashboard" and User profile.
            Assuming the top bar is handled in layout.tsx, we can hide the title here if it's redundant.
            But we'll keep it just in case. */}
        <Title level={2} style={{ margin: 0, fontWeight: "bold", display: "none" }}>Dashboard</Title>
      </div>

      <StatCards stats={stats} role={currentUserRole} loading={loading} />

      <Row gutter={[24, 24]} style={{ display: "flex" }}>
        <Col xs={24} lg={16} style={{ display: "flex", flexDirection: "column" }}>
          <ActivityChart data={activityData} role={currentUserRole} />
        </Col>
        <Col xs={24} lg={8} style={{ display: "flex", flexDirection: "column" }}>
          <ApprovalList data={pendingApprovals} role={currentUserRole} />
        </Col>
      </Row>

      <ActiveClassesTable data={activeClasses} loading={loading} />
    </div>
  );
}
