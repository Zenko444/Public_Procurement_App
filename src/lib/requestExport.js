import { Parser } from "@json2csv/plainjs";
import { format } from "date-fns";

function buildTodayFilename() {
  return `cereri-${format(new Date(), "yyyy-MM-dd")}.csv`;
}

export function exportRequestsToCsv(requests) {
  const fields = [
    { label: "ID Cerere", value: "id" },
    { label: "Titlu", value: "title" },
    { label: "Descriere", value: "description" },
    { label: "Primarie", value: "city_hall_name" },
    { label: "Localitate", value: "locality" },
    { label: "Furnizor", value: "provider_name" },
    { label: "Serviciu", value: "service_name" },
    { label: "Status", value: "status" },
    { label: "Data Cerere", value: "request_date" },
    {
      label: "Data Creare",
      value: (row) => (row.created_at ? format(new Date(row.created_at), "yyyy-MM-dd HH:mm") : ""),
    },
  ];

  const parser = new Parser({
    fields,
    withBOM: true,
    delimiter: ";",
    defaultValue: "",
  });

  const csv = parser.parse(requests);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const fileUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = fileUrl;
  link.setAttribute("download", buildTodayFilename());
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(fileUrl);
}

export function filterRequestsFromToday(requests) {
  const today = new Date();

  return requests.filter((request) => {
    if (!request.created_at) return false;
    const createdAt = new Date(request.created_at);
    return (
      createdAt.getFullYear() === today.getFullYear() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getDate() === today.getDate()
    );
  });
}
