export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Resumen general del negocio</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Clientes totales', value: '—', color: 'bg-blue-50 text-blue-700' },
          { label: 'Presupuestos este mes', value: '—', color: 'bg-green-50 text-green-700' },
          { label: 'Monto total (mes)', value: '—', color: 'bg-purple-50 text-purple-700' },
          { label: 'Pendientes de respuesta', value: '—', color: 'bg-amber-50 text-amber-700' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.color} rounded-lg px-3 py-1 inline-block`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
