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

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderCard = (student: any, rank: number) => {
    if (!student) return null;

    const isTop1 = rank === 1;
    const badgeColor = rank === 1 ? "#531DAB" : rank === 2 ? "#FAAD14" : "#52C41A";
    const avatarBg = rank === 1 ? "linear-gradient(135deg, #722ED1 0%, #1677FF 100%)" : rank === 2 ? "linear-gradient(135deg, #FAAD14 0%, #FFD666 100%)" : "linear-gradient(135deg, #52C41A 0%, #95DE64 100%)";
    const height = isTop1 ? 300 : 260;
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
            width: 240,
            height: height,
            marginTop: marginTop,
            textAlign: "center",
            borderRadius: 24,
            boxShadow: isMe ? `0 8px 24px ${badgeColor}4D` : "0 8px 24px rgba(0,0,0,0.06)",
            border: isMe ? `3px solid ${badgeColor}` : "none",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            background: isMe ? "linear-gradient(180deg, #ffffff 0%, #f0f5ff 100%)" : "#ffffff",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          styles={{ body: { padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" } }}
          className="top-card-hover"
        >
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              background: badgeColor,
              color: "white",
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "900",
              fontSize: 20,
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 2
            }}
          >
            #{rank}
          </div>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Avatar
              size={isTop1 ? 110 : 90}
              style={{ 
                background: avatarBg, 
                color: "#fff", 
                fontSize: isTop1 ? "44px" : "36px", 
                fontWeight: "bold",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                border: `4px solid ${isMe ? badgeColor : '#fff'}`
              }}
            >
              {getInitials(student.name)}
            </Avatar>
            {isTop1 && (
              <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#FADB14', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#1F2937', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>
                MVP
              </div>
            )}
          </div>
          <Title level={4} style={{ margin: 0, fontSize: isTop1 ? 22 : 18, color: '#1F2937', fontWeight: 800 }}>
            {student.name}
          </Title>
          {isMe && <Text style={{ fontSize: "13px", color: badgeColor, fontWeight: 700, marginBottom: '4px' }}>It's You!</Text>}
          <Text strong style={{ color: badgeColor, fontSize: isTop1 ? 24 : 20, margin: '8px 0', display: 'block' }}>
            {student.totalScore} <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>pts</span>
          </Text>
          <div style={{ background: '#F3F4F6', padding: '6px 12px', borderRadius: '50px', display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 'auto' }}>
            {student.badgeImage && (
              <img src={student.badgeImage} alt="badge" width={20} height={20} style={{ objectFit: 'contain' }} />
            )}
            <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600 }}>{student.badgeName}</Text>
          </div>
        </Card>
      </Tooltip>
    );
  };

  return (
    <>
        <style>{`
            .top-card-hover:hover {
                transform: translateY(-8px);
                box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important;
            }
        `}</style>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 48, flexWrap: "wrap", alignItems: "flex-end" }}>
        {renderCard(top2, 2)}
        {renderCard(top1, 1)}
        {renderCard(top3, 3)}
        </div>
    </>
  );
};
