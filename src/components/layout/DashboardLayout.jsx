import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Settings, Layers, Building2, FileText, LayoutDashboard, MessageSquare } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-baby-dark animate-spin" />
          <p className="text-lg text-slate-600 font-extralight">
            Se încarcă...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AdminBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function AdminBar() {
  const location = useLocation();

  const adminLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/services', label: 'Servicii', icon: Layers },
    { href: '/admin/providers', label: 'Furnizori', icon: Building2 },
    { href: '/admin/requests-status', label: 'Status Cereri', icon: FileText },
    { href: '/chatbot', label: 'Chatbot', icon: MessageSquare },
  ];

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="bg-slate-800 text-white">
      <div className="max-w-[1800px] mx-auto px-6 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Settings className="w-4 h-4" />
            <span className="text-lg font-extralight">Admin:</span>
          </div>
          <div className="flex items-center gap-4">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 text-lg font-extralight px-3 py-1 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-baby-dark text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}