import { SERVER_URL } from "./server";

/**
 * Uploads files to the server and returns attachment objects
 */
export async function uploadFiles(files: File[]): Promise<MessageAttachment[]> {
    // Create form data with all files
    const formData = new FormData();

    // Append each file to the form data
    files.forEach(file => {
        formData.append('files', file);
    });

    // Send the files to the backend
    const response = await fetch(`${SERVER_URL}/api/disk-engine/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'File upload failed');
    }

    // Parse the response
    const data = await response.json();
    return data.files;
}
