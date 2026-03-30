"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface SessionUser {
  name?: string;
  email?: string;
}

export default function UserPage() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Add user modal form state
  const [addUserForm, setAddUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "staff",
  });

  // Fetch current user from session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (data && data.user) {
          setCurrentUser(data.user);
          // Parse name into first and last name
          const nameParts = (data.user.name || "").split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || "");
          setEmail(data.user.email || "");
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const handleSaveProfile = () => {
    alert("Profile update coming soon");
  };

  const handleAddUserSubmit = () => {
    alert("User invitation coming soon");
    setShowAddUser(false);
    setAddUserForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "staff",
    });
  };

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

      {/* Team Members */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : currentUser ? (
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">You are the current user</p>
                <p className="font-medium text-gray-900">{currentUser.name || "User"}</p>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Coming soon: Full team member management and invitations will be available here.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Unable to load user information</p>
          )}
        </CardBody>
      </Card>

      {/* Your Profile */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </CardBody>
        <CardFooter>
          <Button variant="primary" onClick={handleSaveProfile}>
            Save changes
          </Button>
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
              <Input
                label="First Name"
                placeholder="John"
                value={addUserForm.firstName}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, firstName: e.target.value })
                }
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={addUserForm.lastName}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, lastName: e.target.value })
                }
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={addUserForm.email}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, email: e.target.value })
                }
              />
              <Select
                label="Role"
                value={addUserForm.role}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, role: e.target.value })
                }
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
              <Button variant="primary" onClick={handleAddUserSubmit}>
                Add User
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
