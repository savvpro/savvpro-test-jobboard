"use client";
import { useState } from "react";
import StatusBadge from "./StatusBadge";

export default function ApplicationRow({ app }: { app: any }) {
  const [status, setStatus] = useState(app.status);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleStatusUpdate = async (newStatus: string) => {
    if (!note) {
      setError("A note is required for all status changes.");
      return;
    }
    
    const res = await fetch(`http://127.0.0.1:8000/api/applications/${app.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, note })
    });

    if (res.ok) {
      setStatus(newStatus);
      setNote("");
      setError("");
    } else {
      const data = await res.json();
      setError(data.detail || "Failed to update status.");
    }
  };

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td className="p-4">
        <div className="font-bold text-slate-900">{app.applicant_name}</div>
        <div className="text-sm text-slate-600">{app.email}</div>
      </td>
      <td className="p-4 font-semibold text-slate-800">{app.years_experience} yrs</td>
      <td className="p-4"><StatusBadge status={status} /></td>
      <td className="p-4">
        <div className="flex flex-col gap-2">
          {error && <span className="text-red-600 text-xs font-bold">{error}</span>}
          <input 
            type="text" 
            placeholder="Required note..." 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            className="border border-slate-400 p-1 text-sm rounded text-slate-900 placeholder:text-slate-500"
          />
          <div className="flex gap-2">
            <button onClick={() => handleStatusUpdate("shortlisted")} className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold hover:bg-blue-700">Shortlist</button>
            <button onClick={() => handleStatusUpdate("offered")} className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold hover:bg-green-700">Offer</button>
            <button onClick={() => handleStatusUpdate("rejected")} className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold hover:bg-red-700">Reject</button>
          </div>
        </div>
      </td>
    </tr>
  );
}