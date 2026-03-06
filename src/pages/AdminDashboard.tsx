import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { LayoutDashboard, Settings, FolderKanban, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin');
  };

  const apps = [
    {
      title: 'Website Editor',
      description: 'Manage portfolio projects, about section, and contact details.',
      icon: <Settings className="w-8 h-8 text-white" />,
      link: '/admin/editor',
      color: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50'
    },
    {
      title: 'QR Redirect Manager',
      description: 'Control where your /qr link points to and manage presets.',
      icon: <FolderKanban className="w-8 h-8 text-white" />,
      link: '/admin/qr-manager',
      color: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <Helmet>
        <title>Admin Dashboard - STUDIOWHT</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-400 text-sm">Select an app to manage</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-105 text-sm font-medium hover:text-red-400 group"
          >
            <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app, index) => (
            <Link to={app.link} key={index}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-8 rounded-2xl border transition-all duration-300 group cursor-pointer h-full ${app.color}`}
              >
                <div className="mb-6 bg-black/50 w-16 h-16 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  {app.icon}
                </div>
                <h2 className="text-xl font-bold mb-2">{app.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {app.description}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
