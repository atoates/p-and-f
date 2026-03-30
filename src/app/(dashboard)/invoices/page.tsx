"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  status: string;
  totalAmount: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  order?: {
    enquiry?: {
      clientName: string;
    };
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/invoices");
        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }
        const data = await response.json();
        setInvoices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const statusColors: Record<string, "primary" | "success" | "warning" | "danger" | "secondary"> = {
    draft: "secondary",
    sent: "warning",
    paid: "success",
    overdue: "danger",
    cancelled: "danger",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price: string) => {
    return `£${parseFloat(price).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Create and manage invoices</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          New Invoice
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardBody>
            <p className="text-red-800">Error: {error}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4332]"></div>
                <p className="mt-4 text-gray-600">Loading invoices...</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <CardBody>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 text-lg">No invoices yet</p>
                <p className="text-gray-400 mt-1">Create your first invoice to get started</p>
              </div>
            </CardBody>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Invoice Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Paid Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.order?.enquiry?.clientName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={statusColors[invoice.status as keyof typeof statusColors]}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatPrice(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(invoice.paidAt)}
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
