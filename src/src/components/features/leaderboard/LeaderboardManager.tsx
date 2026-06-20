"use client";

import React from "react";
import { Typography, Select, Radio } from "antd";
import { useLeaderboard } from "@/src/hooks/leaderboard/useLeaderboard";
import { Top3Cards } from "@/src/components/features/leaderboard/Top3Cards";
import { LeaderboardTable } from "@/src/components/features/leaderboard/LeaderboardTable";

const { Title, Text } = Typography;

export default function LeaderboardManager() {
  const {
    courses,
    classes,
    studentsRank,
    loading,
    selectedCourse,
    setSelectedCourse,
    rankingType,
    setRankingType,
    selectedClass,
    setSelectedClass
  } = useLeaderboard();

  return (
    <div style={{ padding: "24px", minHeight: "100vh"}}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 16
      }}>
        
        {/* Kiri: Judul */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <Title level={3} style={{ margin: 0, fontWeight: "bold" }}>Leaderboard</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>In this page, you will see your position</Text>
        </div>

        {/* Tengah: Toggle */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: "200px" }}>
          <div style={{ backgroundColor: "#e6e6e6", padding: 4, borderRadius: 8 }}>
            <Radio.Group 
              optionType="button" 
              buttonStyle="solid"
              value={rankingType}
              onChange={(e) => {
                setRankingType(e.target.value);
                setSelectedClass(null); // reset class selection on toggle
              }}
              style={{
                borderRadius: 8,
              }}
            >
              <Radio.Button value="global" style={{ borderRadius: "8px 0 0 8px", border: "none", boxShadow: "none" }}>Global Rankings</Radio.Button>
              <Radio.Button value="class" style={{ borderRadius: "0 8px 8px 0", border: "none", boxShadow: "none" }}>Class Rankings</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {/* Kanan: Filter Course & Class */}
        <div style={{  display: "flex", gap: 16, alignItems: "flex-end", justifyContent: "flex-end", minWidth: "250px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Text strong>Filter Course <span style={{ color: "red" }}>*</span></Text>
            <Select
              style={{ width: 200 }}
              placeholder="Pilih Course"
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={courses.map(c => ({ label: c.course_name, value: c.id }))}
            />
          </div>

          {rankingType === "class" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Text strong>Filter Class <span style={{ color: "red" }}>*</span></Text>
              <Select
                style={{ width: 200 }}
                placeholder="Pilih Kelas"
                value={selectedClass}
                onChange={setSelectedClass}
                options={classes.map(c => ({ label: c.class_name, value: c.id }))}
              />
            </div>
          )}
        </div>
      </div>

      {rankingType === "class" && !selectedClass ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Text type="secondary" style={{ fontSize: 18 }}>Silakan pilih kelas terlebih dahulu untuk melihat ranking.</Text>
        </div>
      ) : (
        <>
          {studentsRank.length > 0 && (
            <Top3Cards data={studentsRank} />
          )}

          <LeaderboardTable data={studentsRank} loading={loading} />
        </>
      )}
    </div>
  );
}

