import type { SyncRequestDTO, SyncResponseDTO } from "@repo/protocol/schemas";

const BASE_URL =
  import.meta.env.VITE_SYNC_URL?.toString() ?? "http://localhost:3000";

export async function pingServer(): Promise<{
  status: string;
  time: string;
}> {
  const res = await fetch(`${BASE_URL}/sync/health`);
  if (!res.ok) {
    throw new Error(`Ping failed with status ${res.status}`);
  }

  const data = (await res.json()) as { status: string; time: string };
  return data;
}

export async function sendSync(
  payload: SyncRequestDTO
): Promise<SyncResponseDTO> {
  const res = await fetch(`${BASE_URL}/sync/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Sync failed with status ${res.status}`);
  }

  return (await res.json()) as SyncResponseDTO;
}
