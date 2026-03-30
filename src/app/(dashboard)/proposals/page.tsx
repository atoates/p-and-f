"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Plus, Download } from "lucide-react";
import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/data-grid";
import { StatusBadgeRenderer, DateRenderer } from "@/components/ui/grid-renderers";

interface Proposal {
  id: string;
  orderId: string;
  status: string;
  sentAt?: string;
  createdAt: string;
  order?: {
    enquiry?: {
      clientName: string;
    };
  };
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/proposals");
        if (!response.ok) {
          throw new Error("Failed to fetch proposals");
        }
        const data = await response.json();
        setProposals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const handleDownload = async (id: string) => {
    try {
      setDownloadingId(id);
      const response = await fetch(`/api/proposals/${id}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-${id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download proposal PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const columnDefs: ColDef[] = [
    {
      field: "order.enquiry.clientName",
      headerName: "Client",
      width: 180,
      sortable: true,
      filter: true,
      valueGetter: (params) => params.data?.order?.enquiry?.clientName || "Unknown",
    },
    {
      field: "orderId",
      headerName: "Order ID",
      width: 150,
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        const orderId = params.value || "";
        return `${orderId.slice(0, 8)}...`;
      },
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
      field: "sentAt",
      headerName: "Sent Date",
      width: 130,
      cellRenderer: DateRenderer,
      sortable: true,
      filter: true,
    },
    {
      field: "createdAt",
      headerName: "Created Date",
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
          <h1 className="text-3xl font-serif font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-600 mt-1">Create and send professional proposals</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          New Proposal
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
            rowData={proposals}
            columnDefs={columnDefs}
            loading={loading}
            emptyMessage="No proposals yet. Create your first proposal to get started."
            pageSize={20}
          />
        </CardBody>
      </Card>
    </div>
  );
}
