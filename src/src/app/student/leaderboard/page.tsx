"use client";

import React, { useEffect, useState } from "react";
import { Typography, Select, Radio } from "antd";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { Top3Cards } from "./components/Top3Cards";
import { LeaderboardTable } from "./components/LeaderboardTable";

const { Title, Text } = Typography;

export default function LeaderboardPage() {
  const [loggedInUserId, setLoggedInUserId] = useState<number | undefined>();
  const [studentName, setStudentName] = useState<string>("Pelajar");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lsUser = localStorage.getItem("user");
      if (lsUser) {
        try {
          const userObj = JSON.parse(lsUser);
          setLoggedInUserId(Number(userObj.id));
          setStudentName(userObj.name || "Pelajar");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);
  const {
    courses,
    studentsRank,
    loading,
    selectedCourse,
    setSelectedCourse,
    rankingType,
    setRankingType
  } = useLeaderboard();

  return (
    <div style={{ minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header section with heading */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: "32px", color: "#5B21B6", display: 'flex', alignItems: 'center', gap: '8px' }}>
          Leaderboard 🏆
        </Title>
        <Text style={{ fontSize: "14px", color: "#4B5563" }}>
          In this page, you will see your position and overall rankings among other students.
        </Text>
      </div>

      {/* Motivation Banner */}
      <div style={{ 
        backgroundColor: "#CCFBF1", 
        color: "#0F766E", 
        padding: "12px 20px", 
        borderRadius: "9999px", 
        marginBottom: 32,
        fontWeight: 600,
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        🎉 You're doing great, {studentName}! The top is within reach!
      </div>

      {/* Rankings Toggle Bar & Filter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        {/* Toggle */}
        <div style={{ backgroundColor: "#ffffff", padding: "6px", borderRadius: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <style>{`
            .ranking-toggle-btn .ant-radio-button-wrapper-checked {
              background-color: #5B21B6 !important;
              border-color: #5B21B6 !important;
              color: #FFFFFF !important;
              font-weight: 700 !important;
            }
            .ranking-toggle-btn .ant-radio-button-wrapper {
              border: none !important;
              background-color: transparent !important;
              color: #4B5563 !important;
              font-weight: 600;
              height: 38px;
              line-height: 38px;
              border-radius: 10px !important;
              padding: 0 24px;
              transition: all 0.3s;
            }
            .ranking-toggle-btn .ant-radio-button-wrapper:not(:first-child)::before {
              display: none !important;
            }
            .ranking-toggle-btn .ant-radio-button-wrapper:hover {
              color: #5B21B6 !important;
            }
          `}</style>
          <Radio.Group 
            className="ranking-toggle-btn"
            optionType="button" 
            buttonStyle="solid"
            value={rankingType}
            onChange={(e) => {
              setRankingType(e.target.value);
            }}
          >
            <Radio.Button value="global">Global Rankings</Radio.Button>
            <Radio.Button value="class">My Class</Radio.Button>
          </Radio.Group>
        </div>

        {/* Filter Course */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Text style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", textTransform: 'uppercase' }}>
            Filter Course <span style={{ color: "red" }}>*</span>
          </Text>
          <Select
            style={{ width: 240, height: "42px" }}
            placeholder="Pilih Course"
            value={selectedCourse}
            onChange={setSelectedCourse}
            options={courses.map(c => ({ label: c.course_name, value: c.id }))}
          />
        </div>
      </div>

      {/* Podium and Table */}
      <div style={{ marginTop: 24 }}>
        {studentsRank.length > 0 && (
          <Top3Cards data={studentsRank} loggedInUserId={loggedInUserId} />
        )}
        <LeaderboardTable data={studentsRank} loading={loading} loggedInUserId={loggedInUserId} />
      </div>
    </div>
  );
}
