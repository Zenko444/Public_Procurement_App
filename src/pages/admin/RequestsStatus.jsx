import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  Save,
  X,
  Check,
  XCircle,
  Clock,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";

const statusOptions = [
  { id: "pending", name: "In asteptare", icon: Clock, color: "text-amber-600" },
  { id: "accepted", name: "Acceptat", icon: Check, color: "text-green-600" },
  { id: "rejected", name: "Respins", icon: XCircle, color: "text-red-600" },
];

export default function RequestsStatusAdmin() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRequest, setEditingRequest] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchAllRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Eroare la incarcarea cererilor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const openEditModal = (request) => {
    setEditingRequest(request);
    setNewStatus(request.status);
    setStatusNotes(request.status_notes || "");
  };

  const closeEditModal = () => {
    setEditingRequest(null);
    setNewStatus("");
    setStatusNotes("");
  };

  const handleUpdateStatus = async () => {
    if (!editingRequest || !newStatus) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("requests")
        .update({
          status: newStatus,
          status_notes: statusNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingRequest.id);

      if (error) throw error;

      toast.success("Statusul cererii a fost actualizat!");
      closeEditModal();
      fetchAllRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Eroare la actualizarea statusului");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRequest) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("requests")
        .delete()
        .eq("id", deleteRequest.id);

      if (error) throw error;

      toast.success("Cererea a fost stearsa!");
      setDeleteRequest(null);
      fetchAllRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Eroare la stergerea cererii");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-lg text-slate-500 font-extralight">
          Se incarca...
        </div>
      </div>
    );
  }

  return (
    <div id="requests-status-admin-page" className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/requests")}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">
            Administrare Cereri
          </h1>
          <p className="text-lg text-slate-500 font-extralight">
            {requests.length} cereri in total
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Cerere
                </th>
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Primarie
                </th>
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Furnizor
                </th>
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Data
                </th>
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-lg font-medium text-slate-600">
                  Actiuni
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-baby-light/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-baby-dark" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-800 truncate max-w-[200px]">
                          {request.title}
                        </p>
                        <p className="text-lg text-slate-500 font-extralight">
                          {request.service_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-lg text-slate-700 font-extralight truncate max-w-[150px]">
                        {request.city_hall_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg text-slate-700 font-extralight">
                      {request.provider_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-lg text-slate-700 font-extralight">
                        {format(new Date(request.created_at), "d MMM yyyy", {
                          locale: ro,
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/requests/${request.id}`}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Vizualizeaza"
                      >
                        <Eye className="w-5 h-5 text-slate-500" />
                      </Link>
                      <button
                        onClick={() => openEditModal(request)}
                        className="p-2 hover:bg-baby-light/30 rounded-lg transition-colors"
                        title="Modifica Status"
                      >
                        <Check className="w-5 h-5 text-baby-dark" />
                      </button>
                      <button
                        onClick={() => setDeleteRequest(request)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sterge"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editingRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">
                  Actualizare Status
                </h2>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                <p className="text-lg font-medium text-slate-800">
                  {editingRequest.title}
                </p>
                <p className="text-lg text-slate-500 font-extralight">
                  {editingRequest.city_hall_name} - {editingRequest.service_name}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <label className="block text-lg font-medium text-slate-700">
                  Status Nou
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setNewStatus(option.id)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          newStatus === option.id
                            ? "border-baby-dark bg-baby-light/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${option.color}`} />
                        <span className="text-lg font-medium text-slate-700">
                          {option.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="block text-lg font-medium text-slate-700">
                  Note (optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Adaugati note sau explicatii..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-lg font-extralight text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-baby-blue/50 focus:border-baby-blue transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeEditModal}>
                  Anuleaza
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  loading={submitting}
                  icon={Save}
                >
                  Salveaza
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    Sterge cererea
                  </h3>
                  <p className="text-lg text-slate-500 font-extralight">
                    Aceasta actiune este ireversibila
                  </p>
                </div>
              </div>

              <p className="text-lg text-slate-600 font-extralight mb-6">
                Esti sigur ca vrei sa stergi cererea "{deleteRequest.title}"?
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteRequest(null)}
                >
                  Anuleaza
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleting}
                  icon={Trash2}
                >
                  Sterge definitiv
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
