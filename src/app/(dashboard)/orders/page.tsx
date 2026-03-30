"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function OrdersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all orders</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          New Order
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-lg">No orders yet</p>
            <p className="text-gray-400 mt-1">Create your first order to get started</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
