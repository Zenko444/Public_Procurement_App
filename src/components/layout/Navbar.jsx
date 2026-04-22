import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Key, 
  ChevronDown,
  Building2,
  X,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  CalendarDays,
  CircleDashed,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useRequests } from '../../hooks/useRequests';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function Navbar() {
  const { user, cityHall, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const {
    searchTerm,
    dateFilter,
    statusFilter,
    serviceFilter,
    statusOptions,
    serviceOptions,
    setSearchTerm,
    setDateFilter,
    setStatusFilter,
    setServiceFilter,
  } = useRequests();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);
    return () => clearTimeout(debounce);
  }, [localSearch, setSearchTerm]);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50">
      <div className="h-full max-w-[1800px] mx-auto px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-3 text-slate-800 hover:text-baby-dark transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-baby-light to-baby-dark flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Smart City</span>
        </Link>

        {user && location.pathname === '/requests' && (
          <div className="flex-1 max-w-4xl mx-8">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Caută după serviciu, furnizor sau titlu..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full h-11 pl-12 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-baby-blue/50 focus:border-baby-blue transition-all"
                />
                {localSearch && (
                  <button
                    onClick={() => setLocalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-11 w-36 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-baby-blue/50"
                >
                  <option value="all">Toate datele</option>
                  <option value="day">Ziua curenta</option>
                  <option value="month">Luna curenta</option>
                  <option value="year">Anul curent</option>
                </select>
              </div>

              <div className="relative">
                <CircleDashed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 w-36 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-baby-blue/50"
                >
                  <option value="all">Toate statusurile</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="h-11 w-40 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-baby-blue/50"
                >
                  <option value="all">Toate serviciile</option>
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 text-sm font-medium transition-colors"
            >
              {isDarkMode ? 'LIGHT MODE' : 'DARK MODE'}
            </button>
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                      <h3 className="text-lg font-medium text-slate-800">Notificări</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-lg text-baby-dark hover:text-baby-blue transition-colors font-extralight"
                        >
                          Marchează toate ca citite
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 font-extralight text-lg">
                          Nu aveți notificări
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                              !notification.is_read ? 'bg-baby-light/20' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-lg font-medium text-slate-800 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-lg text-slate-600 font-extralight mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-lg text-slate-400 font-extralight mt-2">
                                  {format(new Date(notification.created_at), 'd MMM, HH:mm', { locale: ro })}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="w-2 h-2 rounded-full bg-baby-dark mt-2" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-baby-light to-baby-dark flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-lg font-medium text-slate-800 truncate max-w-[150px]">
                    {cityHall?.name || 'Primărie'}
                  </p>
                  <p className="text-lg text-slate-500 font-extralight truncate max-w-[150px]">
                    {cityHall?.locality}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-16 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
                  >
                    <div className="p-2">
                      <Link
                        to="/account"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg text-slate-700 font-extralight hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-slate-500" />
                        Contul meu
                      </Link>
                      <Link
                        to="/change-password"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg text-slate-700 font-extralight hover:bg-slate-50 transition-colors"
                      >
                        <Key className="w-5 h-5 text-slate-500" />
                        Schimba parola
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg text-red-600 font-extralight hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        Deconectare
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}