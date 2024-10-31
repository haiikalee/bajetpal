import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { CalendarIcon, CreditCard, LineChart, Settings, LogOut } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <div className="w-64 bg-white shadow-md h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">BajetPal</h1>
      </div>
      <nav className="mt-4 flex-grow">
        <Link 
          href="/dashboard" 
          className={`flex items-center px-4 py-2 text-gray-700 ${pathname === '/dashboard' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
        >
          <LineChart className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
        <Link 
          href="/transactions" 
          className={`flex items-center px-4 py-2 text-gray-700 ${pathname === '/transactions' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Transactions
        </Link>
        <Link 
          href="/budget" 
          className={`flex items-center px-4 py-2 text-gray-700 ${pathname === '/budget' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          Budget
        </Link>
        <Link 
          href="/settings" 
          className={`flex items-center px-4 py-2 text-gray-700 ${pathname === '/settings' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Link>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 mb-4"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </button>
    </div>
  )
}