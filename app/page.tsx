'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, X, Check } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  regular_price: string;
  status: string;
  images: Array<{ src: string; alt: string }>;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    regular_price: '',
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/products');
      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error || 'Failed to fetch products');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Create product
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setFormData({ name: '', regular_price: '' });
        setShowCreateForm(false);
        fetchProducts();
      } else {
        setError(result.error || 'Failed to create product');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setCreating(false);
    }
  };

  // Update product price
  const handleUpdatePrice = async (id: number) => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      setUpdating(id);
      setError(null);
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regular_price: newPrice }),
      });

      const result = await response.json();

      if (result.success) {
        setEditingPrice(null);
        setNewPrice('');
        fetchProducts();
      } else {
        setError(result.error || 'Failed to update product');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setUpdating(null);
    }
  };

  // Delete product
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setDeleting(id);
      setError(null);
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchProducts();
      } else {
        setError(result.error || 'Failed to delete product');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Mini Product Manager
          </h1>
          <p className="text-indigo-700 dark:text-indigo-300">
            Manage your WooCommerce products with ease
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Create Product Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/50 transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {showCreateForm ? 'Cancel' : 'Add New Product'}
          </button>
        </div>

        {/* Create Product Form */}
        {showCreateForm && (
          <div className="mb-6 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-indigo-100 dark:border-indigo-900">
            <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-4">
              Create New Product
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-indigo-200 dark:border-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-indigo-900/30 dark:text-white transition-colors"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2"
                >
                  Regular Price
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  value={formData.regular_price}
                  onChange={(e) =>
                    setFormData({ ...formData, regular_price: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-indigo-200 dark:border-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-indigo-900/30 dark:text-white transition-colors"
                  placeholder="0.00"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all shadow-md shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Product
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-indigo-100 dark:border-indigo-900">
            <p className="text-indigo-600 dark:text-indigo-400">
              No products found. Create your first product!
            </p>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-indigo-100 dark:border-indigo-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-indigo-100 dark:divide-indigo-900">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].src}
                              alt={product.images[0].alt || product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-indigo-400 dark:text-indigo-500 text-xs">
                              No Image
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900 dark:text-indigo-100">
                        #{product.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-indigo-900 dark:text-indigo-100 font-medium">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingPrice === product.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-24 px-2 py-1 border border-indigo-300 dark:border-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-indigo-900/30 dark:text-white text-sm transition-colors"
                              placeholder={product.regular_price}
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdatePrice(product.id)}
                              disabled={updating === product.id}
                              className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 disabled:opacity-50 transition-colors"
                              title="Save"
                            >
                              {updating === product.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingPrice(null);
                                setNewPrice('');
                              }}
                              className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                              ${product.regular_price}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPrice(product.id);
                                setNewPrice(product.regular_price);
                              }}
                              className="p-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                              title="Edit Price"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.status === 'publish'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50"
                          title="Delete Product"
                        >
                          {deleting === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
