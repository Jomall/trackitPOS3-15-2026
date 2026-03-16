import { PrismaClient, Vehicle } from '@prisma/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/format-date'

const prisma = new PrismaClient()

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      maintenances: {
        orderBy: { date: 'desc' },
        take: 10
      },
      damages: {
        orderBy: { date: 'desc' },
        take: 10
      },
      rentalAgreements: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          rentalClient: {
            select: { name: true, phone: true }
          }
        }
      }
    }
  })

  if (!vehicle) notFound()

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <Link href="/vehicle-rental/fleet" className="inline-flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700 font-bold text-lg">
        ← Back to Fleet
      </Link>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🚗 {vehicle.licensePlate}</h1>
            <p className="text-xl text-gray-600">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Info</h2>
              <div className="space-y-4">
                <div><strong>License Plate:</strong> {vehicle.licensePlate}</div>
                <div><strong>VIN:</strong> {vehicle.vin}</div>
                <div><strong>Color:</strong> {vehicle.color || 'N/A'}</div>
                <div><strong>Category:</strong> {vehicle.category || 'N/A'}</div>
                <div><strong>Transmission:</strong> {vehicle.transmissionType || 'N/A'}</div>
                <div><strong>Fuel Type:</strong> {vehicle.fuelType || 'N/A'}</div>
                <div><strong>Status:</strong> <span className={`px-3 py-1 rounded-full text-sm font-bold ${vehicle.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{vehicle.status}</span></div>
                <div><strong>Odometer:</strong> {vehicle.currentOdometerReading || 'N/A'} km</div>
                <div><strong>Next Service:</strong> {formatDate(vehicle.nextServiceDueDate)}</div>\n
                <div><strong>Notes:</strong> {vehicle.notes || 'None'}</div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions</h2>
              <div className="space-y-4">
                <Link href="/vehicle-rental/fleet" className="block p-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 text-center font-bold">
                  ✏️ Edit Vehicle (Fleet List)
                </Link>
                <Link href="/vehicle-rental/fleet" className="block p-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 text-center font-bold">
                  ← Back to Fleet
                </Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Maintenances ({vehicle.maintenances.length})</h3>
              {vehicle.maintenances.length > 0 ? (
                <div className="space-y-3">
                  {vehicle.maintenances.map((m: any) => (
                    <div key={m.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="font-bold">{m.type}</div>
                      <div className="text-sm text-gray-600">{formatDate(m.date)}</div>
                      {m.cost && <div className="text-sm font-bold text-green-600">${m.cost}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No maintenance records</p>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Damages ({vehicle.damages.length})</h3>
              {vehicle.damages.length > 0 ? (
                <div className="space-y-3">
                  {vehicle.damages.map((d: any) => (
                    <div key={d.id} className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-xl">
                      <div>${d.amount}</div>
                      <div className="text-sm text-gray-600">{d.description}</div>
                      <div className="text-xs text-gray-500">{formatDate(d.date)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No damages</p>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rental Agreements ({vehicle.rentalAgreements.length})</h3>
              {vehicle.rentalAgreements.length > 0 ? (
                <div className="space-y-3">
                  {vehicle.rentalAgreements.map((r: any) => (
                    <div key={r.id} className="p-4 bg-blue-50 rounded-xl">
                      <div className="font-bold">{r.agreementNumber}</div>
                      <div className="text-sm">{r.agreementType}</div>
                      <div className="text-xs text-gray-500">{r.startDate} to {r.endDate || 'Ongoing'}</div>
                      <div className="text-xs">Status: {r.status}</div>
                      <div className="text-xs">Client: {r.rentalClient.name} ({r.rentalClient.phone})</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No rental agreements</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

