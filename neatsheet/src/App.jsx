import { NavLink, Route, Routes } from 'react-router-dom'
import FraudDashboardPage from './pages/FraudDashboardPage'
import HomePage from './pages/HomePage'
import StatementsPage from './pages/StatementsPage'
import UploadPage from './pages/UploadPage'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/upload', label: 'Upload Data' },
  { to: '/statements', label: 'Financial Statements' },
  { to: '/fraud-scanner', label: 'Fraud Scanner Dashboard' },
]

function App() {
  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-bold text-emerald-950">Auditmatic</h1>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/statements" element={<StatementsPage />} />
          <Route path="/fraud-scanner" element={<FraudDashboardPage />} />
        </Routes>
      </div>
    </main>
  )
}

export default App
