"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  wholesalePrice?: string;
  retailPrice?: string;
  colour?: string;
  season?: string;
  supplier?: string;
  isActive: string;
}

export default function LibrariesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ["All", "Flowers", "Foliage", "Sundries", "Containers", "Ribbons"];

  const filteredProducts = selectedCategory && selectedCategory !== "All"
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const formatPrice = (price?: string) => {
    if (!price) return "-";
    return `£${parseFloat(price).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Libraries</h1>
          <p className="text-gray-600 mt-1">Manage your product library</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          Add Product
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardBody>
            <p className="text-red-800">Error: {error}</p>
          </CardBody>
        </Card>
      )}

      {/* Category Tabs */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === "All" ? null : category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  (selectedCategory === category || (selectedCategory === null && category === "All"))
                    ? "bg-[#1B4332] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4332]"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <CardBody>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 mt-1">Add your first product to get started</p>
              </div>
            </CardBody>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Wholesale Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Retail Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Colour
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Season
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Supplier
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatPrice(product.wholesalePrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatPrice(product.retailPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.colour || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.season || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.supplier || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
