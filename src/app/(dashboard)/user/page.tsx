"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function UserPage() {
  const [showAddUser, setShowAddUser] = useState(false);

  const users = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@floraldesign.com",
      role: "admin",
    },
    {
      id: "2",
      name: "Emma Smith",
      email: "emma@floraldesign.com",
      role: "manager",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage team members and permissions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddUser(true)}
        >
          <Plus size={20} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Users List */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                    {user.role}
                  </span>
                  <button className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Your Profile */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value="Sarah" />
            <Input label="Last Name" value="Johnson" />
          </div>
          <Input label="Email" type="email" value="sarah@floraldesign.com" />
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm Password" type="password" />
        </CardBody>
        <CardFooter>
          <Button variant="primary">Save changes</Button>
        </CardFooter>
      </Card>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input label="First Name" placeholder="John" />
              <Input label="Last Name" placeholder="Doe" />
              <Input label="Email" type="email" placeholder="john@example.com" />
              <Select
                label="Role"
                options={[
                  { value: "staff", label: "Staff" },
                  { value: "manager", label: "Manager" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            </CardBody>
            <CardFooter className="space-x-4">
              <Button variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
              <Button variant="primary">Add User</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
