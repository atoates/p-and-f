"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

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

  const statusColors: Record<string, "primary" | "success" | "warning" | "danger" | "secondary"> = {
    draft: "secondary",
    sent: "primary",
    accepted: "success",
    rejected: "danger",
    expired: "danger",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4332]"></div>
                <p className="mt-4 text-gray-600">Loading proposals...</p>
              </div>
            </div>
          ) : proposals.length === 0 ? (
            <CardBody>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 text-lg">No proposals yet</p>
                <p className="text-gray-400 mt-1">Create your first proposal to get started</p>
              </div>
            </CardBody>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Sent Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr
                    key={proposal.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {proposal.order?.enquiry?.clientName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {proposal.orderId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={statusColors[proposal.status as keyof typeof statusColors]}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(proposal.sentAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(proposal.createdAt)}
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
