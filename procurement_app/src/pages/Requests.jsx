import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Building2, 
  MapPin,
  ArrowRight,
  Inbox
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useRequests } from '../hooks/useRequests';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';

export default function Requests() {
  const { requests, loading, searchTerm, dateFilter, statusFilter, serviceFilter } = useRequests();
  const { cityHall } = useAuth();
  const hasActiveFilters =
    !!searchTerm || dateFilter !== 'all' || statusFilter !== 'all' || serviceFilter !== 'all';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-lg text-slate-500 font-extralight">Se încarcă cererile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">Cererile mele</h1>
          <p className="text-lg text-slate-500 font-extralight">
            {cityHall?.name} • {requests.length} cereri
            {searchTerm && ` • Căutare: "${searchTerm}"`}
            {dateFilter !== 'all' && ` • Perioadă: ${dateFilter}`}
            {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
            {serviceFilter !== 'all' && ` • Serviciu: ${serviceFilter}`}
          </p>
        </div>
        <Link to="/create-request">
          <Button icon={Plus} size="lg">
            Cerere nouă
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Inbox className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-800 mb-2">
            {hasActiveFilters ? 'Nu s-au găsit rezultate' : 'Nu aveți cereri'}
          </h3>
          <p className="text-lg text-slate-500 font-extralight mb-6">
            {hasActiveFilters 
              ? 'Încercați o altă căutare sau creați o cerere nouă.'
              : 'Creați prima cerere pentru a solicita servicii de la furnizori.'}
          </p>
          <Link to="/create-request">
            <Button icon={Plus}>
              Creează cerere
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">Titlu</th>
                  <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">Furnizor</th>
                  <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">Serviciu</th>
                  <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">Data</th>
                  <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">Status</th>
                  <th className="text-right px-6 py-4 text-lg font-medium text-slate-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
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
                          <p className="text-lg text-slate-500 font-extralight truncate max-w-[200px]">
                            {request.description || 'Fără descriere'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-lg text-slate-700 font-extralight">
                          {request.provider_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg text-slate-700 font-extralight">
                        {request.service_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-lg text-slate-700 font-extralight">
                          {format(new Date(request.created_at), 'd MMM yyyy', { locale: ro })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/requests/${request.id}`}
                        className="inline-flex items-center gap-2 text-lg text-baby-dark hover:text-baby-blue transition-colors font-medium"
                      >
                        Detalii
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
