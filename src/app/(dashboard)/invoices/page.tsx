"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Plus, Download } from "lucide-react";
import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/data-grid";
import { StatusBadgeRenderer, CurrencyRenderer, DateRenderer } from "@/components/ui/grid-renderers";

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  const handleDownload = async (id: string) => {
    try {
      setDownloadingId(id);
      const response = await fetch(`/api/invoices/${id}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download invoice PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const columnDefs: ColDef[] = [
    {
      field: "invoiceNumber",
      headerName: "Invoice Number",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      field: "order.enquiry.clientName",
      headerName: "Client",
      width: 180,
      sortable: true,
      filter: true,
      valueGetter: (params) => params.data?.order?.enquiry?.clientName || "Unknown",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      cellRenderer: StatusBadgeRenderer,
      sortable: true,
      filter: true,
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      width: 130,
      cellRenderer: CurrencyRenderer,
      sortable: true,
      filter: true,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 130,
      cellRenderer: DateRenderer,
      sortable: true,
      filter: true,
    },
    {
      field: "paidAt",
      headerName: "Paid Date",
      width: 130,
      cellRenderer: DateRenderer,
      sortable: true,
      filter: true,
    },
    {
      field: "id",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={() => handleDownload(params.value)}
            disabled={downloadingId === params.value}
            className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            title="Download PDF"
          >
            <Download size={18} />
          </button>
        </div>
      ),
    },
  ];

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
        <CardBody className="p-0">
          <DataGrid
            rowData={invoices}
            columnDefs={columnDefs}
            loading={loading}
            emptyMessage="No invoices yet. Create your first invoice to get started."
            pageSize={20}
          />
        </CardBody>
      </Card>
    </div>
  );
}
