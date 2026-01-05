const API_URL = "http://127.0.0.1:8000";

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload/file`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  return res.json();
}
