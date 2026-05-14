export default function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-900 border-yellow-300",
    shortlisted: "bg-blue-100 text-blue-900 border-blue-300",
    offered: "bg-green-100 text-green-900 border-green-300",
    rejected: "bg-red-100 text-red-900 border-red-300",
  };

  const style = colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";

  return (
    <span className={`px-3 py-1 uppercase text-xs font-bold border rounded-full ${style}`}>
      {status}
    </span>
  );
}