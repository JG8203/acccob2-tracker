import { getAttendance } from "@/actions/tracker"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const query = Array.isArray(searchParams.eventId) 
    ? searchParams.eventId[0] 
    : searchParams.eventId || "";

  const results = await getAttendance(query);

  return (
    <pre className="p-4">
        {JSON.stringify(results, null, 2)}
    </pre>
  )
}
