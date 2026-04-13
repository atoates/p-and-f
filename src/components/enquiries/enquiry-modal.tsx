"use client";

import React, { useId, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, Plus, UserCircle } from "lucide-react";
import { useModalA11y } from "@/hooks/use-modal-a11y";
import Link from "next/link";

interface ContactOption {
  id: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
}

interface Enquiry {
  id: string;
  contactId?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  eventType?: string;
  eventDate?: string;
  venueA?: string;
  venueB?: string;
  progress: string;
  notes?: string;
  createdAt: string;
}

interface EnquiryModalProps {
  isOpen: boolean;
  enquiry?: Enquiry | null;
  onClose: () => void;
  onSave: (enquiry: Partial<Enquiry>) => Promise<void>;
}

const EVENT_TYPES = [
  "Wedding",
  "Corporate",
  "Birthday",
  "Sympathy",
  "Anniversary",
  "Baby Shower",
  "Engagement Party",
  "Prom",
  "Other",
];

const PROGRESS_OPTIONS = ["New", "TBD", "Live", "Done", "Placed", "Order"];

export function EnquiryModal({
  isOpen,
  enquiry,
  onClose,
  onSave,
}: EnquiryModalProps) {
  const titleId = useId();
  const { dialogRef } = useModalA11y(isOpen, onClose);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Enquiry>>({
    contactId: null,
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    eventType: "",
    eventDate: "",
    venueA: "",
    venueB: "",
    progress: "New",
    notes: "",
  });

  // Fetch contacts for the selector
  useEffect(() => {
    if (!isOpen) return;
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/contacts?type=customer");
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
        }
      } catch {
        // Silently fail; manual entry is still available
      }
    };
    fetchContacts();
  }, [isOpen]);

  useEffect(() => {
    if (enquiry) {
      setFormData({
        contactId: enquiry.contactId || null,
        clientName: enquiry.clientName || "",
        clientEmail: enquiry.clientEmail || "",
        clientPhone: enquiry.clientPhone || "",
        eventType: enquiry.eventType || "",
        eventDate: enquiry.eventDate
          ? new Date(enquiry.eventDate).toISOString().split("T")[0]
          : "",
        venueA: enquiry.venueA || "",
        venueB: enquiry.venueB || "",
        progress: enquiry.progress || "New",
        notes: enquiry.notes || "",
      });
      // If editing and there's a contactId, find the matching contact
      if (enquiry.contactId) {
        const match = contacts.find((c) => c.id === enquiry.contactId);
        setSelectedContact(match || null);
      } else {
        setSelectedContact(null);
      }
    } else {
      setFormData({
        contactId: null,
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        eventType: "",
        eventDate: "",
        venueA: "",
        venueB: "",
        progress: "New",
        notes: "",
      });
      setSelectedContact(null);
      setContactSearch("");
    }
  }, [enquiry, isOpen, contacts]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleSelectContact = (contact: ContactOption) => {
    setSelectedContact(contact);
    const name = [contact.firstName, contact.lastName]
      .filter(Boolean)
      .join(" ");
    setFormData((prev) => ({
      ...prev,
      contactId: contact.id,
      clientName: name,
      clientEmail: contact.email || "",
      clientPhone: contact.phone || "",
    }));
    setShowContactDropdown(false);
    setContactSearch("");
  };

  const handleClearContact = () => {
    setSelectedContact(null);
    setFormData((prev) => ({
      ...prev,
      contactId: null,
      clientName: "",
      clientEmail: "",
      clientPhone: "",
    }));
  };

  const filteredContacts = contactSearch
    ? contacts.filter((c) => {
        const full = [c.firstName, c.lastName, c.email, c.companyName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return full.includes(contactSearch.toLowerCase());
      })
    : contacts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.clientEmail) {
      toast.error("Client name and email are required");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving enquiry:", error);
      toast.error("Failed to save enquiry");
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
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto focus:outline-none"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2
            id={titleId}
            className="text-lg sm:text-2xl font-serif font-bold text-gray-900"
          >
            {enquiry ? "Edit Enquiry" : "New Enquiry"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Contact selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
              Client
            </label>

            {selectedContact ? (
              <div className="flex items-center justify-between bg-sage-50 border border-sage-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserCircle size={20} className="text-primary-green" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formData.clientName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {[formData.clientEmail, formData.clientPhone]
                        .filter(Boolean)
                        .join(" \u00b7 ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/contacts/${selectedContact.id}`}
                    className="text-xs text-[#1B4332] hover:underline"
                    target="_blank"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={handleClearContact}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={contactSearch}
                    onChange={(e) => {
                      setContactSearch(e.target.value);
                      setShowContactDropdown(true);
                    }}
                    onFocus={() => setShowContactDropdown(true)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-sm"
                  />
                </div>

                {showContactDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredContacts.length > 0 ? (
                      filteredContacts.slice(0, 10).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSelectContact(c)}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {[c.firstName, c.lastName]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {[c.email, c.companyName]
                              .filter(Boolean)
                              .join(" \u00b7 ")}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No contacts found
                      </div>
                    )}
                    <Link
                      href="/contacts"
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1B4332] hover:bg-gray-50 border-t border-gray-200 font-medium"
                      onClick={() => setShowContactDropdown(false)}
                    >
                      <Plus size={14} />
                      Create new contact
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Manual fallback fields if no contact selected */}
            {!selectedContact && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Client Name *"
                  name="clientName"
                  value={formData.clientName || ""}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Smith"
                  required
                />

                <Input
                  label="Client Email *"
                  name="clientEmail"
                  type="email"
                  value={formData.clientEmail || ""}
                  onChange={handleChange}
                  placeholder="e.g. sarah@example.com"
                  required
                />

                <Input
                  label="Client Phone"
                  name="clientPhone"
                  type="tel"
                  value={formData.clientPhone || ""}
                  onChange={handleChange}
                  placeholder="e.g. 07700 000000"
                />
              </div>
            )}
          </div>

          {/* Event details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                name="eventType"
                value={formData.eventType || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-colors"
              >
                <option value="">Select an event type</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Event Date"
              name="eventDate"
              type="date"
              value={formData.eventDate || ""}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress
              </label>
              <select
                name="progress"
                value={formData.progress || "New"}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-colors"
              >
                {PROGRESS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Venue A"
              name="venueA"
              value={formData.venueA || ""}
              onChange={handleChange}
              placeholder="e.g. Town Hall"
            />

            <Input
              label="Venue B"
              name="venueB"
              value={formData.venueB || ""}
              onChange={handleChange}
              placeholder="e.g. Church"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Add any additional notes about this enquiry..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Enquiry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
