"use client";

import React, { useId, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useModalA11y } from "@/hooks/use-modal-a11y";

type ContactType = "customer" | "supplier" | "both";

interface Contact {
  id: string;
  type: ContactType;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  county?: string | null;
  postcode?: string | null;
  country?: string | null;
  paymentTerms?: string | null;
  vatNumber?: string | null;
  accountRef?: string | null;
  tags?: string | null;
  notes?: string | null;
}

interface ContactModalProps {
  isOpen: boolean;
  contact?: Contact | null;
  onClose: () => void;
  onSave: (data: Partial<Contact>) => Promise<void>;
}

const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
  { value: "both", label: "Both" },
];

const emptyForm = {
  type: "customer" as ContactType,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  mobile: "",
  companyName: "",
  jobTitle: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  county: "",
  postcode: "",
  country: "United Kingdom",
  paymentTerms: "",
  vatNumber: "",
  accountRef: "",
  tags: "",
  notes: "",
};

export function ContactModal({
  isOpen,
  contact,
  onClose,
  onSave,
}: ContactModalProps) {
  const titleId = useId();
  const { dialogRef } = useModalA11y(isOpen, onClose);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (contact) {
      setFormData({
        type: contact.type || "customer",
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        mobile: contact.mobile || "",
        companyName: contact.companyName || "",
        jobTitle: contact.jobTitle || "",
        website: contact.website || "",
        addressLine1: contact.addressLine1 || "",
        addressLine2: contact.addressLine2 || "",
        city: contact.city || "",
        county: contact.county || "",
        postcode: contact.postcode || "",
        country: contact.country || "United Kingdom",
        paymentTerms: contact.paymentTerms || "",
        vatNumber: contact.vatNumber || "",
        accountRef: contact.accountRef || "",
        tags: contact.tags || "",
        notes: contact.notes || "",
      });
    } else {
      setFormData(emptyForm);
    }
  }, [contact, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
      toast.success(contact ? "Contact updated" : "Contact created");
    } catch {
      toast.error("Failed to save contact");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto focus:outline-none"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2
            id={titleId}
            className="text-lg sm:text-2xl font-serif font-bold text-gray-900"
          >
            {contact ? "Edit Contact" : "New Contact"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Contact type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Type
            </label>
            <div className="flex gap-3">
              {CONTACT_TYPES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex-1 text-center px-4 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                    formData.type === value
                      ? "bg-[#1B4332] text-white border-[#1B4332]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={formData.type === value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Personal details */}
          <fieldset>
            <legend className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Personal Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Sarah"
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Smith"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. sarah@example.com"
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 01onal 000000"
              />
              <Input
                label="Mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 07700 000000"
              />
              <Input
                label="Company"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Bloom Events Ltd"
              />
              <Input
                label="Job Title"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Wedding Planner"
              />
              <Input
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="e.g. https://example.com"
              />
            </div>
          </fieldset>

          {/* Address */}
          <fieldset>
            <legend className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Address
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Address Line 1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="e.g. 12 High Street"
              />
              <Input
                label="Address Line 2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
              />
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Bristol"
              />
              <Input
                label="County"
                name="county"
                value={formData.county}
                onChange={handleChange}
                placeholder="e.g. Avon"
              />
              <Input
                label="Postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                placeholder="e.g. BS1 2AB"
              />
              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          {/* Business details */}
          <fieldset>
            <legend className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Business Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Payment Terms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                placeholder="e.g. 30 days"
              />
              <Input
                label="VAT Number"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                placeholder="e.g. GB123456789"
              />
              <Input
                label="Account Ref"
                name="accountRef"
                value={formData.accountRef}
                onChange={handleChange}
                placeholder="e.g. ACC001"
              />
            </div>
          </fieldset>

          {/* Tags and notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. VIP, wedding, corporate"
              helperText="Comma-separated tags"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about this contact..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
