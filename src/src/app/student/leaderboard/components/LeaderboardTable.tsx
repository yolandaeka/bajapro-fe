import React, { useState } from "react";
import { Table, Button, Input, Space, Typography } from "antd";
import { FileExcelOutlined, FilePdfOutlined, SearchOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Text } = Typography;

interface LeaderboardTableProps {
  data: any[];
  loading: boolean;
  loggedInUserId?: number;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data, loading, loggedInUserId }) => {
  const [searchText, setSearchText] = useState("");

  const tableData = data
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }))
    .slice(3) // Start from index 3 (Rank 4)
    .filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
    },
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Badge",
      key: "badge",
      render: (_: any, record: any) => (
        <Space>
          {record.badgeImage && <img src={record.badgeImage} alt="badge" width={24} />}
          <Text>{record.badgeName}</Text>
        </Space>
      ),
    },
    {
      title: "Reading Score",
      dataIndex: "readingScore",
      key: "readingScore",
      align: "center" as const,
    },
    {
      title: "Coding Score",
      dataIndex: "codingScore",
      key: "codingScore",
      align: "center" as const,
    },
    {
      title: "Essay Score",
      dataIndex: "essayScore",
      key: "essayScore",
      align: "center" as const,
    },
    {
      title: "Total Score",
      dataIndex: "totalScore",
      key: "totalScore",
      align: "center" as const,
      render: (score: number) => <Text strong>{score}</Text>
    },
  ];

  return (
    <div style={{ backgroundColor: "white", padding: 24, borderRadius: 16 }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        marginBottom: 16,
      }}>
        <Input 
          placeholder="Cari..." 
          prefix={<SearchOutlined />} 
          style={{ width: 250, borderRadius: 8 }} 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={tableData} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
        rowClassName={(record) => record.id === loggedInUserId ? "highlight-row" : ""}
      />
      <style>{`
        .highlight-row {
          background-color: #f0f5ff !important;
          font-weight: 600;
        }
        .highlight-row td {
          border-top: 2px solid #531DAB !important;
          border-bottom: 2px solid #531DAB !important;
        }
        .highlight-row td:first-child {
          border-left: 2px solid #531DAB !important;
        }
        .highlight-row td:last-child {
          border-right: 2px solid #531DAB !important;
        }
      `}</style>
    </div>
  );
};
