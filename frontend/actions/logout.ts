"use server";
import { cookies } from "next/headers";
import { SERVER_URL } from "@/lib/server";

export default async function logout() {
  const cookieStore = await cookies();

  if (!cookieStore.get("openbeliever-machine")) {
    return;
  }

  const res = await fetch(`${SERVER_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
    },
    credentials: "include",
  });

  if (res.ok) {
    cookieStore.delete("openbeliever-machine");
    return;
  }

  throw new Error("Failed to logout");
}
