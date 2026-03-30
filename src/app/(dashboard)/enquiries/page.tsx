"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Archive } from "lucide-react";

export default function EnquiriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Mock data
  const enquiries = [
    {
      id: "1",
      clientName: "Sarah Johnson",
      clientEmail: "sarah@example.com",
      eventType: "Wedding",
      eventDate: "2026-06-15",
      progress: "Live",
      createdAt: "2026-03-20",
    },
    {
      id: "2",
      clientName: "Emma Smith",
      clientEmail: "emma@example.com",
      eventType: "Corporate Event",
      eventDate: "2026-04-10",
      progress: "TBD",
      createdAt: "2026-03-18",
    },
    {
      id: "3",
      clientName: "Michael Brown",
      clientEmail: "michael@example.com",
      eventType: "Birthday",
      eventDate: "2026-05-22",
      progress: "New",
      createdAt: "2026-03-25",
    },
  ];

  const statusColors: Record<string, "primary" | "success" | "warning" | "danger" | "secondary"> = {
    New: "warning",
    TBD: "secondary",
    Live: "success",
    Done: "primary",
    Placed: "primary",
    Order: "success",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
          <p className="text-gray-600 mt-1">Manage and track client enquiries</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          Add New
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by client name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>

            <select
              value={selectedStatus || ""}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
            >
              <option value="">All statuses</option>
              <option value="New">New</option>
              <option value="TBD">TBD</option>
              <option value="Live">Live</option>
              <option value="Done">Done</option>
              <option value="Placed">Placed</option>
              <option value="Order">Order</option>
            </select>

            <Button variant="outline">
              <Filter size={20} className="mr-2" />
              More filters
            </Button>

            <Button variant="outline">
              <Archive size={20} className="mr-2" />
              Archive
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Client Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Event Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Event Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr
                  key={enquiry.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {enquiry.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {enquiry.clientEmail}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {enquiry.eventType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(enquiry.eventDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant={statusColors[enquiry.progress as keyof typeof statusColors]}>
                      {enquiry.progress}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(enquiry.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
