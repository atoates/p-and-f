"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Create and manage invoices</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          New Invoice
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-lg">No invoices yet</p>
            <p className="text-gray-400 mt-1">Create your first invoice to get started</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
