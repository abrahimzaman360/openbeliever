import { SERVER_URL } from "@/lib/server";

export const uploadAttachments = async (files: File[], messageId: string): Promise<MessageAttachment[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("attachment", file));
    formData.append("messageId", messageId);

    const res = await fetch(`${SERVER_URL}/api/chat-engine/conversations/upload-attachments`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload attachments");
    const { attachments } = await res.json();
    return attachments;
};