import React from "react";
import { Avatar, Card, Typography, Tooltip } from "antd";

const { Title, Text } = Typography;

interface Top3CardsProps {
  data: any[];
  loggedInUserId?: number;
}

export const Top3Cards: React.FC<Top3CardsProps> = ({ data, loggedInUserId }) => {
  // Data should be pre-sorted descending by score.
  const top1 = data[0];
  const top2 = data[1];
  const top3 = data[2];

  const renderCard = (student: any, rank: number) => {
    if (!student) return null;

    const isTop1 = rank === 1;
    const badgeColor = rank === 1 ? "#531DAB" : rank === 2 ? "#FAAD14" : "#52C41A";
    const height = isTop1 ? 280 : 240;
    const marginTop = isTop1 ? 0 : 40;
    const isMe = student.id === loggedInUserId;

    const tooltipContent = (
      <div>
        <div>Reading Score: <b>{student.readingScore}</b></div>
        <div>Coding Score: <b>{student.codingScore}</b></div>
        <div>Essay Score: <b>{student.essayScore}</b></div>
      </div>
    );

    return (
      <Tooltip key={student.id} title={tooltipContent} placement="top">
        <Card
          style={{
            width: 220,
            height: height,
            marginTop: marginTop,
            textAlign: "center",
            borderRadius: 16,
            boxShadow: isMe ? `0 0 20px ${badgeColor}66` : "0 4px 12px rgba(0,0,0,0.1)",
            border: `2px solid ${badgeColor}`,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            background: isMe ? "linear-gradient(to bottom, #ffffff, #f0f5ff)" : "#ffffff"
          }}
          styles={{ body: { padding: "20px 10px" } }}
        >
          <div
            style={{
              position: "absolute",
              top: -15,
              right: -15,
              backgroundColor: badgeColor,
              color: "white",
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: 18,
              border: "3px solid white"
            }}
          >
            #{rank}
          </div>
          <Avatar
            size={isTop1 ? 100 : 80}
            style={{ backgroundColor: "#f0f0f0", marginBottom: 16 }}
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
          />
          <Title level={4} style={{ margin: 0, fontSize: isTop1 ? 20 : 18 }}>
            {student.name} {isMe && <span style={{fontSize: "14px", color: badgeColor}}>(You)</span>}
          </Title>
          <Text strong style={{ color: badgeColor, fontSize: isTop1 ? 18 : 16 }}>
            {student.totalScore}
          </Text>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {student.badgeImage && (
              <img src={student.badgeImage} alt="badge" width={24} height={24} />
            )}
            <Text type="secondary">{student.badgeName}</Text>
          </div>
        </Card>
      </Tooltip>
    );
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 40, flexWrap: "wrap", alignItems: "flex-end" }}>
      {renderCard(top2, 2)}
      {renderCard(top1, 1)}
      {renderCard(top3, 3)}
    </div>
  );
};
