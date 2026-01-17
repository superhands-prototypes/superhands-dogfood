import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import EarlyAccess from '@/pages/EarlyAccess'
import Waitlist from '@/pages/Waitlist'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/early-access" element={<EarlyAccess />} />
      <Route path="/waitlist" element={<Waitlist />} />
      {/* Catch-all route for menubar preview embedding and unknown paths */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
