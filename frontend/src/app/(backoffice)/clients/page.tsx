export default function ClientsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">Gestión de clientes y prospectos</p>
        </div>
        <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors">
          + Nuevo cliente
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6 text-center text-gray-400">
          <p className="text-sm">Conectá Supabase en <code className="bg-gray-100 px-1 rounded">.env.local</code> para ver los clientes.</p>
        </div>
      </div>
    </div>
  );
}
