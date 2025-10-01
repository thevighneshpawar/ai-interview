import { useState } from "react";
import { Upload, Card, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Upload as LucideUpload } from "lucide-react";

import { useDispatch } from "react-redux";
import { addCandidate } from "../candidatesSlice";
import { extractTextFromPdf } from "../../utils/pdfParse";
import { extractTextFromDocx } from "../../utils/docxParse";
import { extractContactInfo } from "../../utils/extractContact";
import type { RcFile } from "antd/es/upload";
import { useNavigate } from "react-router-dom";

const { Dragger } = Upload;

// 📝 Simple resume keyword detection
function looksLikeResume(text: string) {
  const keywords = ["experience", "education", "skills", "projects"];
  return keywords.some((kw) => text.toLowerCase().includes(kw));
}

export default function ResumeUploader() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFile = async (file: RcFile) => {
    setLoading(true);
    try {
      let text = "";
      if (file.type === "application/pdf") {
        text = await extractTextFromPdf(file);
      } else if (file.name.endsWith(".docx")) {
        text = await extractTextFromDocx(file);
      } else {
        message.error("Invalid file type. Please upload PDF or DOCX.");
        setLoading(false);
        return false;
      }

      if (!looksLikeResume(text)) {
        message.error(
          "This file does not look like a resume. Please upload a valid resume."
        );
        console.log(
          "This file does not look like a resume. Please upload a valid resume."
        );

        setLoading(false);
        return false;
      }

      const info = extractContactInfo(text);

      // Save candidate in Redux
      const action = addCandidate({
        name: info.name,
        email: info.email,
        phone: info.phone,
        resumeText: text,
      });
      dispatch(action);

      const newCandidateId = action.payload.id;

      // Check if any details missing → go to collector
      if (!info.name || !info.email || !info.phone) {
        navigate(`/collect/${newCandidateId}`);
      } else {
        navigate(`/interview/${newCandidateId}/chat`);
      }

      message.success("Resume uploaded successfully!");
    } catch (err) {
      console.error(err);
      message.error("Failed to parse resume.");
    } finally {
      setLoading(false);
    }

    return false; // prevent auto upload
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-xl shadow-lg rounded-xl">
        <div className="text-center mb-4">
          <LucideUpload className="w-10 h-10 text-indigo-500 mx-auto" />
          <h2 className="text-xl font-bold mt-2">Upload Your Resume</h2>
          <p className="text-gray-500">PDF or DOCX only</p>
        </div>

        <Dragger
          multiple={false}
          showUploadList={false}
          beforeUpload={(file) => handleFile(file)}
          disabled={loading}
          accept=".pdf,.docx"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area</p>
          <p className="ant-upload-hint">Supports PDF or DOCX format</p>
        </Dragger>
      </Card>
    </div>
  );
}
