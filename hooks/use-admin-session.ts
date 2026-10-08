import useSWR from "swr";

interface AdminSession {
  email: string;
  name: string;
  restaurantId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAdminSession() {
  const { data } = useSWR<{ admin: AdminSession | null }>("/api/auth/session", fetcher);
  return { admin: data?.admin ?? null };
}
