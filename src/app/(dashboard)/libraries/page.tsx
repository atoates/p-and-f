"use client";

import { Card, CardBody } from "@/components/ui/card";

export default function LibrariesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Libraries</h1>
        <p className="text-gray-600 mt-1">Manage your product and service libraries</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Products</h3>
            <p className="text-gray-600 mb-4">
              Create and manage your product library for easy ordering
            </p>
            <button className="text-primary-green font-medium hover:text-light-green">
              Manage products →
            </button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Services</h3>
            <p className="text-gray-600 mb-4">
              Create and manage additional services offered
            </p>
            <button className="text-primary-green font-medium hover:text-light-green">
              Manage services →
            </button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
