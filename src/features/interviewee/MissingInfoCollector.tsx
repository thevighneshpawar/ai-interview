import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Input, Button } from "antd";
import type { RootState } from "../../app/store";
import { updateCandidate } from "../candidatesSlice";

export default function MissingInfoCollector() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const candidate = useSelector((s: RootState) =>
    id ? s.candidates.byId[id] : null
  );

  const [name, setName] = useState(candidate?.name || "");
  const [email, setEmail] = useState(candidate?.email || "");
  const [phone, setPhone] = useState(candidate?.phone || "");

  if (!candidate) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500">Candidate not found</p>
        <Button onClick={() => navigate("/")}>Back</Button>
      </div>
    );
  }

  const missing: { field: "name" | "email" | "phone"; label: string }[] = [];
  if (!candidate.name) missing.push({ field: "name", label: "your full name" });
  if (!candidate.email) missing.push({ field: "email", label: "your email" });
  if (!candidate.phone)
    missing.push({ field: "phone", label: "your phone number" });

  const handleSubmit = () => {
    dispatch(
      updateCandidate({
        id: candidate.id,
        name,
        email,
        phone,
      })
    );
    navigate(`/interview/${candidate.id}/chat`);
  };

  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card className="p-6 shadow-lg rounded-xl">
        <h2 className="text-xl font-bold mb-4 text-indigo-600">
          👋 Hi {candidate.name || "there"}, I just need a few details before we
          start.
        </h2>

        {missing.map((m) => (
          <div
            key={m.field}
            className="mb-4"
          >
            <p className="font-medium text-gray-700 mb-1">
              Please enter {m.label}:
            </p>
            <Input
              value={
                m.field === "name" ? name : m.field === "email" ? email : phone
              }
              onChange={(e) => {
                const val = e.target.value;
                if (m.field === "name") setName(val);
                if (m.field === "email") setEmail(val);
                if (m.field === "phone") setPhone(val);
              }}
              placeholder={`Type ${m.label}...`}
            />
          </div>
        ))}

        <Button
          type="primary"
          block
          className="mt-4"
          onClick={handleSubmit}
          disabled={
            (!candidate.name && !name) ||
            (!candidate.email && !email) ||
            (!candidate.phone && !phone)
          }
        >
          Continue to Interview
        </Button>
      </Card>
    </div>
  );
}
