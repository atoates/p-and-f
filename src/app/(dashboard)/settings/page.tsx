"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SettingsTab = "branding" | "company" | "pricing" | "proposal" | "invoice" | "delivery" | "legal";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("branding");

  const tabs: { id: SettingsTab; name: string }[] = [
    { id: "branding", name: "Branding" },
    { id: "company", name: "Company Details" },
    { id: "pricing", name: "Price Settings" },
    { id: "proposal", name: "Proposal Settings" },
    { id: "invoice", name: "Invoice Settings" },
    { id: "delivery", name: "Delivery Address" },
    { id: "legal", name: "Legal Stuff" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and business settings</p>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-green text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "branding" && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Branding</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <input type="file" className="block w-full" />
                </div>
                <Input label="Brand Colour (Primary)" type="color" />
                <Input label="Brand Colour (Accent)" type="color" />
              </CardBody>
              <CardFooter>
                <Button variant="primary">Save changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "company" && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Company Details</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Company Name" />
                <Input label="Registration Number" />
                <Input label="Contact Number" />
                <Input label="Email" type="email" />
                <Input label="Website" type="url" />
              </CardBody>
              <CardFooter>
                <Button variant="primary">Save changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "pricing" && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Price Settings</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Markup Multiple" type="number" step="0.1" />
                <Input label="Flower Buffer %" type="number" step="0.1" />
                <Input label="Fuel Cost per Litre (£)" type="number" step="0.01" />
                <Input label="Miles per Gallon" type="number" />
                <Input label="Staff Cost per Hour (£)" type="number" step="0.01" />
                <Input label="Staff Margin" type="number" step="0.1" />
              </CardBody>
              <CardFooter>
                <Button variant="primary">Save changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "proposal" && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Proposal Settings</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Text
                  </label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Footer Text
                  </label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={4} />
                </div>
              </CardBody>
              <CardFooter>
                <Button variant="primary">Save changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "invoice" && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Invoice Settings</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Details
                  </label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={2} />
                </div>
              </CardBody>
              <CardFooter>
                <Button variant="primary">Save changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "delivery" && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Building Name" />
                <Input label="Street" />
                <Input label="Town" />
                <Input label="City" />
                <Input label="Postcode" />
                <Input label="Country" />
              </CardBody>
              <CardFooter>
                <Button variant="primary">Save changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "legal" && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Legal</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms and Conditions
                  </label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Policy
                  </label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={6} />
                </div>
              </CardBody>
              <CardFooter>
                <Button variant="primary">Save changes</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
