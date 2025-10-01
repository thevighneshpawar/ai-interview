import React from "react";
import { useSelector } from "react-redux";
import { Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../app/store";

export default function Dashboard() {
  const navigate = useNavigate();
  const candidates = useSelector((s: RootState) =>
    s.candidates.allIds.map((id) => s.candidates.byId[id])
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (name: string, record: any) => (
        <span
          className="text-indigo-600 cursor-pointer"
          onClick={() => navigate(`/interviewer/${record.id}`)}
        >
          {name || "Unnamed"}
        </span>
      ),
    },
    { title: "Email", dataIndex: "email" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "completed" ? "green" : "blue"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Final Score",
      dataIndex: "finalScore",
      render: (score: number) =>
        score !== undefined ? <span>{score}/100</span> : "—",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Candidate Dashboard</h1>
      <Table
        rowKey="id"
        dataSource={candidates}
        columns={columns}
        bordered
      />
    </div>
  );
}
