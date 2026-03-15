import Link from 'next/link'

export default function Home() {
  const menuItems = [
    {
      href: "/login",
      title: "Login",
      description: "Access your account",
      icon: "🔐",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    },
    {
      href: "/inventory",
      title: "View Inventory",
      description: "Manage all inventory items",
      icon: "📦",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700"
    },
    {
      href: "/bakery",
      title: "Bakery Stock",
      description: "Bakery equipment & supplies",
      icon: "🥖",
      color: "from-yellow-500 to-yellow-600",
      hoverColor: "hover:from-yellow-600 hover:to-yellow-700"
    },
    {
      href: "/auto-parts",
      title: "Auto Parts",
      description: "Automotive parts inventory",
      icon: "🔧",
      color: "from-red-500 to-red-600",
      hoverColor: "hover:from-red-600 hover:to-red-700"
    },
    {
      href: "/auto-parts?tab=pos",
      title: "POS System",
      description: "Point of Sale & Sales Reports",
      icon: "💰",
      color: "from-emerald-500 to-emerald-600",
      hoverColor: "hover:from-emerald-600 hover:to-emerald-700"
    },
    {
      href: "/maintenance",
      title: "Vehicle Maintenance",
      description: "Track vehicle maintenance",
      icon: "🚗",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700"
    },
    {
      href: "/accommodation",
      title: "Accommodation Rental",
      description: "Manage rental agreements & payments",
      icon: "🏠",
      color: "from-indigo-500 to-purple-600",
      hoverColor: "hover:from-indigo-600 hover:to-purple-700"
    },
    {
      href: "/vehicle-rental",
      title: "Vehicle Rental Management",
      description: "Fleet management and client rentals",
      icon: "🚘",
      color: "from-orange-500 to-red-600",
      hoverColor: "hover:from-orange-600 hover:to-red-700"
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
            <span className="text-6xl">📊</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Trackit POS</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive Inventory and Maintenance Management System
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`group relative bg-gradient-to-r ${item.color} ${item.hoverColor} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  {item.description}
                </p>
              </div>

              {/* Hover Arrow */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-2xl">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Choose an option above to get started with inventory management
          </p>
        </div>
      </div>
    </main>
  )
}

