"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function WholesalePage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wholesale</h1>
          <p className="text-gray-600 mt-1">Manage supplier orders and stock</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          New Wholesale Order
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-lg">No wholesale orders yet</p>
            <p className="text-gray-400 mt-1">Create your first wholesale order to get started</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
