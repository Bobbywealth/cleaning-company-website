import { useState, useEffect } from 'react';
import {
  Package, AlertTriangle, Plus, Edit2, Trash2, Search, TrendingDown
} from 'lucide-react';

export default function InventoryManagement({ isDarkMode }) {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', category: '', unit: '', quantity: 0, min_quantity: 10, cost_per_unit: 0, supplier: ''
  });

  const categories = ['Cleaning Supplies', 'Equipment', 'Safety Gear', 'Paper Products', 'Chemicals', 'Other'];

  useEffect(() => {
    fetchInventory();
    fetchLowStock();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };

  const fetchLowStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/inventory/low-stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLowStock(data);
    } catch (err) {
      console.error('Failed to fetch low stock:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingItem ? `/api/inventory/${editingItem.id}` : '/api/inventory';
      const method = editingItem ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', category: '', unit: '', quantity: 0, min_quantity: 10, cost_per_unit: 0, supplier: '' });
      fetchInventory();
      fetchLowStock();
    } catch (err) {
      console.error('Failed to save inventory item:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInventory();
      fetchLowStock();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      min_quantity: item.min_quantity,
      cost_per_unit: item.cost_per_unit,
      supplier: item.supplier
    });
    setShowForm(true);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = inventory.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.cost_per_unit || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Inventory & Supply Management
        </h2>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-orange-500" size={20} />
            <span className="font-semibold text-orange-500">Low Stock Alert ({lowStock.length} items)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {lowStock.slice(0, 6).map(item => (
              <div key={item.id} className="flex items-center justify-between bg-orange-500/10 rounded-lg px-3 py-2">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.name}</span>
                <span className="text-orange-500 font-mono text-sm">{item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-cyan-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total Items</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{inventory.length}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-orange-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Low Stock Items</span>
          </div>
          <span className={`text-2xl font-bold ${lowStock.length > 0 ? 'text-orange-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lowStock.length}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-green-500 text-xl">$</span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total Value</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${totalValue.toFixed(2)}</span>
        </div>
      </div>

      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
        <input
          type="text"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'
          } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
        />
      </div>

      {showForm && (
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="text"
              placeholder="Unit (e.g., bottles, boxes)"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <input
              type="number"
              placeholder="Current Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <input
              type="number"
              placeholder="Minimum Quantity (Low Stock Alert)"
              value={formData.min_quantity}
              onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cost Per Unit ($)"
              value={formData.cost_per_unit}
              onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <input
              type="text"
              placeholder="Supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                {editingItem ? 'Update' : 'Add'} Item
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); }} className={`px-6 py-2 ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded-lg`}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
        <table className="w-full">
          <thead className={isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Item</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Quantity</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Min</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cost/Unit</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Supplier</th>
              <th className={`px-4 py-3 text-right text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const isLow = parseFloat(item.quantity) <= parseFloat(item.min_quantity);
              return (
                <tr key={item.id} className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} ${isLow ? 'bg-orange-500/5' : ''}`}>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</td>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.category || '-'}</td>
                  <td className={`px-4 py-3 ${isLow ? 'text-orange-500 font-semibold' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.quantity} {item.unit}
                    {isLow && <AlertTriangle size={14} className="inline ml-2" />}
                  </td>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.min_quantity} {item.unit}</td>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(item.cost_per_unit || 0).toFixed(2)}</td>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.supplier || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(item)} className="p-1 hover:text-cyan-500"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-500 ml-2"><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredInventory.length === 0 && (
          <p className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No inventory items found</p>
        )}
      </div>
    </div>
  );
}