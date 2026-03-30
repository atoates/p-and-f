"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface ProductionSchedule {
  id: string;
  orderId: string;
  eventDate?: string;
  items?: string;
  notes?: string;
  status: string;
  createdAt: string;
  order?: {
    enquiry?: {
      clientName: string;
    };
  };
}

export default function ProductionPage() {
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/production");
        if (!response.ok) {
          throw new Error("Failed to fetch production schedules");
        }
        const data = await response.json();
        setSchedules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const statusColors: Record<string, "primary" | "success" | "warning" | "danger" | "secondary"> = {
    not_started: "secondary",
    in_progress: "primary",
    in_preparation: "warning",
    completed: "success",
    on_hold: "warning",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getItemsSummary = (itemsJson?: string) => {
    if (!itemsJson) return "-";
    try {
      const items = JSON.parse(itemsJson);
      if (Array.isArray(items)) {
        return `${items.length} item${items.length !== 1 ? "s" : ""}`;
      }
      return "-";
    } catch {
      return "-";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Production</h1>
          <p className="text-gray-600 mt-1">Schedule and manage production</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          New Schedule
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
                <p className="mt-4 text-gray-600">Loading production schedules...</p>
              </div>
            </div>
          ) : schedules.length === 0 ? (
            <CardBody>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 text-lg">No production schedules yet</p>
                <p className="text-gray-400 mt-1">Create your first schedule to get started</p>
              </div>
            </CardBody>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Event Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Client/Order
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(schedule.eventDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {schedule.order?.enquiry?.clientName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge
                        variant={
                          statusColors[schedule.status as keyof typeof statusColors]
                        }
                      >
                        {schedule.status
                          .split("_")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getItemsSummary(schedule.items)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {schedule.notes || "-"}
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
