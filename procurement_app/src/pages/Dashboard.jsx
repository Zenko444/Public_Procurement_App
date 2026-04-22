import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Building2,
  Layers,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { useRequests } from "../hooks/useRequests";
import { useServices } from "../hooks/useServices";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/ui/Button";

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-md shadow-sm border border-slate-200 p-6 flex items-center gap-5 hover:shadow-md transition-shadow"
    >
      <div
        className={`w-14 h-14 rounded-md flex items-center justify-center ${color}`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-3xl font-medium text-slate-800">{value}</p>
        <p className="text-lg font-extralight text-slate-500">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { requests, loading } = useRequests();
  const { services, providers } = useServices();
  const { cityHall } = useAuth();

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const accepted = requests.filter((r) => r.status === "accepted").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return { total, pending, accepted, rejected };
  }, [requests]);

  const recentRequests = useMemo(() => {
    return requests.slice(0, 5);
  }, [requests]);

  const topProviders = useMemo(() => {
    const providerCount = {};
    requests.forEach((r) => {
      if (r.provider_name) {
        providerCount[r.provider_name] =
          (providerCount[r.provider_name] || 0) + 1;
      }
    });
    return Object.entries(providerCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [requests]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-lg text-slate-500 font-extralight">
          Se incarca dashboard-ul...
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-page" className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-slate-500 font-extralight">
            Bine ati venit, {cityHall?.name || "Primarie"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/requests">
            <Button variant="outline" icon={FileText}>
              Toate cererile
            </Button>
          </Link>
          <Link to="/create-request">
            <Button icon={Plus} size="lg">
              Cerere noua
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FileText}
          label="Total cereri"
          value={stats.total}
          color="bg-gradient-to-br from-baby-light to-baby-dark"
          delay={0}
        />
        <StatCard
          icon={Clock}
          label="In asteptare"
          value={stats.pending}
          color="bg-gradient-to-br from-amber-400 to-amber-600"
          delay={0.05}
        />
        <StatCard
          icon={CheckCircle}
          label="Acceptate"
          value={stats.accepted}
          color="bg-gradient-to-br from-green-400 to-green-600"
          delay={0.1}
        />
        <StatCard
          icon={XCircle}
          label="Respinse"
          value={stats.rejected}
          color="bg-gradient-to-br from-red-400 to-red-600"
          delay={0.15}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-md shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-baby-light/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-baby-dark" />
              </div>
              <h2 className="text-xl font-medium text-slate-800">
                Cereri recente
              </h2>
            </div>
            <Link
              to="/requests"
              className="flex items-center gap-2 text-lg text-baby-dark hover:text-baby-blue font-medium transition-colors"
            >
              Vezi toate
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentRequests.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-lg text-slate-500 font-extralight">
                  Nu aveti cereri inca
                </p>
                <Link to="/create-request" className="mt-4 inline-block">
                  <Button icon={Plus}>Creaza prima cerere</Button>
                </Link>
              </div>
            ) : (
              recentRequests.map((request, index) => (
                <Link
                  key={request.id}
                  to={`/requests/${request.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-md bg-baby-light/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-baby-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-slate-800 truncate">
                      {request.title}
                    </p>
                    <p className="text-lg text-slate-500 font-extralight">
                      {request.provider_name} -{" "}
                      {format(new Date(request.created_at), "d MMM yyyy", {
                        locale: ro,
                      })}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-baby-dark transition-colors" />
                </Link>
              ))
            )}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-md shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-md bg-baby-light/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-baby-dark" />
              </div>
              <h2 className="text-xl font-medium text-slate-800">
                Top furnizori
              </h2>
            </div>
            {topProviders.length === 0 ? (
              <p className="text-lg text-slate-500 font-extralight">
                Niciun furnizor utilizat
              </p>
            ) : (
              <div className="space-y-3">
                {topProviders.map(([name, count], index) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-lg font-medium text-slate-600">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-extralight text-slate-800 truncate">
                        {name}
                      </p>
                    </div>
                    <span className="text-lg font-medium text-baby-dark">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-md shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-md bg-baby-light/30 flex items-center justify-center">
                <Layers className="w-5 h-5 text-baby-dark" />
              </div>
              <h2 className="text-xl font-medium text-slate-800">
                Sumar platformă
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-extralight text-slate-600">
                  Servicii disponibile
                </p>
                <span className="text-lg font-medium text-slate-800">
                  {services.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-extralight text-slate-600">
                  Furnizori activi
                </p>
                <span className="text-lg font-medium text-slate-800">
                  {providers.filter((p) => p.is_active).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-extralight text-slate-600">
                  Rata de acceptare
                </p>
                <span className="text-lg font-medium text-green-600">
                  {stats.total > 0
                    ? Math.round((stats.accepted / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-baby-light/40 to-baby-dark/10 rounded-md border border-baby-blue/20 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-baby-dark" />
              <h3 className="text-xl font-medium text-slate-800">
                Acces rapid
              </h3>
            </div>
            <div className="space-y-3">
              <Link
                to="/create-request"
                className="flex items-center gap-3 p-3 rounded-md bg-white/60 hover:bg-white transition-colors"
              >
                <Plus className="w-5 h-5 text-baby-dark" />
                <span className="text-lg font-extralight text-slate-700">
                  Cerere noua
                </span>
              </Link>
              <Link
                to="/admin/services"
                className="flex items-center gap-3 p-3 rounded-md bg-white/60 hover:bg-white transition-colors"
              >
                <Layers className="w-5 h-5 text-baby-dark" />
                <span className="text-lg font-extralight text-slate-700">
                  Administrare servicii
                </span>
              </Link>
              <Link
                to="/admin/providers"
                className="flex items-center gap-3 p-3 rounded-md bg-white/60 hover:bg-white transition-colors"
              >
                <Building2 className="w-5 h-5 text-baby-dark" />
                <span className="text-lg font-extralight text-slate-700">
                  Administrare furnizori
                </span>
              </Link>
              <Link
                to="/account"
                className="flex items-center gap-3 p-3 rounded-md bg-white/60 hover:bg-white transition-colors"
              >
                <FileText className="w-5 h-5 text-baby-dark" />
                <span className="text-lg font-extralight text-slate-700">
                  Contul meu
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
