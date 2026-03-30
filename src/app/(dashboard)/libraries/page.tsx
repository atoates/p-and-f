"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/data-grid";
import { CurrencyRenderer, CategoryBadgeRenderer } from "@/components/ui/grid-renderers";

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

  const columnDefs: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 180,
      sortable: true,
      filter: true,
    },
    {
      field: "category",
      headerName: "Category",
      width: 140,
      cellRenderer: CategoryBadgeRenderer,
      sortable: true,
      filter: true,
    },
    {
      field: "subcategory",
      headerName: "Subcategory",
      width: 140,
      sortable: true,
      filter: true,
    },
    {
      field: "wholesalePrice",
      headerName: "Wholesale Price",
      width: 140,
      cellRenderer: CurrencyRenderer,
      sortable: true,
      filter: true,
    },
    {
      field: "retailPrice",
      headerName: "Retail Price",
      width: 140,
      cellRenderer: CurrencyRenderer,
      sortable: true,
      filter: true,
    },
    {
      field: "colour",
      headerName: "Colour",
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      field: "season",
      headerName: "Season",
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      field: "supplier",
      headerName: "Supplier",
      width: 140,
      sortable: true,
      filter: true,
    },
  ];

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
                className={`px-4 py-2 rounded-lg font-medium transition-colours ${
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
        <CardBody className="p-0">
          <DataGrid
            rowData={filteredProducts}
            columnDefs={columnDefs}
            loading={loading}
            emptyMessage="No products found. Add your first product to get started."
            pageSize={20}
          />
        </CardBody>
      </Card>
    </div>
  );
}
