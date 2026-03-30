"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function DeliveryPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery</h1>
          <p className="text-gray-600 mt-1">Plan and manage deliveries</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          New Delivery
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-lg">No deliveries scheduled yet</p>
            <p className="text-gray-400 mt-1">Create your first delivery to get started</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
