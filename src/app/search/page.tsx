import { getAttendance } from "@/actions/tracker";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const query = Array.isArray(params.eventId)
    ? params.eventId[0]
    : params.eventId || "";

  const results = await getAttendance(query);

  return (
    <pre className="p-4">
      {JSON.stringify(results, null, 2)}
    </pre>
  );
}