"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Image,
  UserPlus,
  MapPin,
  Smile,
  ChevronDown,
  Globe,
  X,
  ChevronLeft,
  AtSign,
} from "lucide-react";

/* ================= TYPES ================= */

interface User {
  name: string;
  email: string;
  image: string;
}

interface BlogPayload {
  name?: string;
  email?: string;
  profilePic?: string;
  content: string;
  driveLink: string;
  type: string;
}

interface OptionRowProps {
  icon: React.ReactNode;
  label: string;
}

/* ================= COMPONENT ================= */

const HarmonyPost: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [postText, setPostText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  /* ================= FETCH USER ================= */

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get<User[]>(
          "https://threezf-pro-server.onrender.com/customers"
        );
        setUser(res.data[0]);
      } catch (err) {
        console.error("User fetch failed", err);
      }
    };

    fetchUser();
  }, []);

  /* ================= FILE SELECT ================= */

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= GOOGLE DRIVE UPLOAD ================= */

  const uploadToGoogleDrive = async (file: File): Promise<string> => {
    setStatus("Uploading to Drive...");

    const accessToken = "YOUR_GOOGLE_ACCESS_TOKEN";

    const metadata = {
      name: `harmony_${Date.now()}_${file.name}`,
      mimeType: file.type,
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      })
    );
    form.append("file", file);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    const data = await response.json();
    return data.webViewLink || "";
  };

  /* ================= RESET ================= */

  const resetForm = (): void => {
    setPostText("");
    setSelectedFile(null);
    setPreview(null);
    setStatus("");
  };

  /* ================= SUBMIT POST ================= */

  const handlePostSubmit = async (): Promise<void> => {
    if (!postText && !selectedFile) return;

    try {
      setStatus("Processing...");

      let driveUrl = "";

      if (selectedFile) {
        driveUrl = await uploadToGoogleDrive(selectedFile);
      }

      const payload: BlogPayload = {
        name: user?.name,
        email: user?.email,
        profilePic: user?.image,
        content: postText,
        driveLink: driveUrl,
        type: "Harmony post",
      };

      await axios.post(
        "https://threezf-pro-server.onrender.com/blogpost",
        payload
      );

      setStatus("Success!");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      setStatus("Failed to post");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Open Post Box */}
      <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-3">
        <img
          src={user?.image || "/avatar.png"}
          className="w-10 h-10 rounded-full object-cover"
          alt="user"
        />

        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 text-left text-gray-500 bg-gray-100 py-2 px-4 rounded-full"
        >
          What&apos;s on your mind?
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsOpen(false)}>
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-lg font-bold">Harmony post</h1>
            </div>

            <button
              onClick={handlePostSubmit}
              disabled={status.includes("Uploading")}
              className={`font-bold text-lg ${
                postText || selectedFile
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              {status ? "..." : "POST"}
            </button>
          </div>

          {/* Profile */}
          <div className="p-4 flex items-center gap-3">
            <img
              src={user?.image || "/avatar.png"}
              className="w-12 h-12 rounded-full border"
              alt=""
            />

            <div>
              <h2 className="font-bold uppercase">{user?.name}</h2>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border text-[11px] font-bold">
                <Globe size={12} /> PUBLIC <ChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 px-4 overflow-y-auto">
            <textarea
              autoFocus
              value={postText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setPostText(e.target.value)
              }
              placeholder="Share a highlight from your day..."
              className="w-full text-xl outline-none resize-none min-h-[120px]"
            />

            {preview && selectedFile && (
              <div className="relative mt-2 rounded-lg border overflow-hidden">
                <button
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"
                >
                  <X size={20} />
                </button>

                {selectedFile.type.includes("video") ? (
                  <video src={preview} controls />
                ) : (
                  <img src={preview} alt="preview" />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t bg-white">
            <div className="p-3 flex items-center gap-2 overflow-x-auto">
              <button className="p-2 border rounded-lg">
                <ChevronLeft size={18} />
              </button>
              <div className="w-9 h-9 rounded-lg bg-purple-600 shrink-0" />
              <div className="w-9 h-9 rounded-lg bg-red-500 shrink-0" />
              <div className="w-9 h-9 rounded-lg bg-black shrink-0" />
              <button className="p-2 border rounded-lg">
                <AtSign size={18} />
              </button>
            </div>

            <div className="max-h-[250px] overflow-y-auto pb-20">
              <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <Image className="text-green-500" />
                <span className="font-medium">Photos/videos</span>
                <input
                  type="file"
                  hidden
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                />
              </label>

              <OptionRow
                icon={<UserPlus className="text-blue-500" />}
                label="Tag people"
              />
              <OptionRow
                icon={<MapPin className="text-red-500" />}
                label="Add location"
              />
              <OptionRow
                icon={<Smile className="text-yellow-500" />}
                label="Feeling/activity"
              />
            </div>
          </div>

          {/* Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <button
              onClick={handlePostSubmit}
              className={`w-full py-3 rounded-lg font-bold text-white text-lg ${
                postText || selectedFile
                  ? "bg-blue-600"
                  : "bg-blue-400 opacity-70"
              }`}
            >
              {status || "POST"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= OPTION ROW ================= */

const OptionRow: React.FC<OptionRowProps> = ({ icon, label }) => (
  <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-t border-gray-50">
    {icon}
    <span className="font-medium text-gray-700">{label}</span>
  </div>
);

export default HarmonyPost;
