"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaginationControls({ totalCount, page, perPage }: { totalCount: number, page: number, perPage: number}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / perPage);

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center gap-6 mt-8">
      <button 
        disabled={page <= 1} 
        onClick={() => updatePage(page - 1)}
        className="px-4 py-2 bg-slate-900 text-white font-bold rounded disabled:opacity-50 hover:bg-slate-700 transition flex items-center gap-2"
      >
        <span className="text-xl leading-none">&laquo;</span> Prev
      </button>
      <span className="font-semibold text-slate-800 tracking-wide">
        Page {page} of {totalPages || 1}
      </span>
      <button 
        disabled={page >= totalPages} 
        onClick={() => updatePage(page + 1)}
        className="px-4 py-2 bg-slate-900 text-white font-bold rounded disabled:opacity-50 hover:bg-slate-700 transition flex items-center gap-2"
      >
        Next <span className="text-xl leading-none">&raquo;</span>
      </button>
    </div>
  );
}