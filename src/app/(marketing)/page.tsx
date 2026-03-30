import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShoppingCart,
  DollarSign,
  FileCheck,
  Receipt,
  Boxes,
  Wrench,
  Truck,
  CheckCircle,
  ArrowRight,
  Flower,
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-soft-cream to-light-pink">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200">
            <Flower className="text-accent-pink" size={16} />
            <span className="text-sm font-medium text-primary-green">
              Welcome to Petal & Prosper
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-primary-green mb-6">
            Floristry Business
            <br />
            Management Made Simple
          </h1>

          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Manage enquiries, orders, proposals, invoices, and delivery schedules
            all in one intuitive platform. Built specifically for floristry businesses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Start your free trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                Learn more
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-600 mt-6">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-green mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to run your floristry business efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                name: "Enquiries",
                description: "Track and manage client enquiries with full history",
              },
              {
                icon: ShoppingCart,
                name: "Orders",
                description: "Create and manage orders with item tracking",
              },
              {
                icon: DollarSign,
                name: "Pricing",
                description: "Automated quote generation with custom pricing",
              },
              {
                icon: FileCheck,
                name: "Proposals",
                description: "Professional proposal templates and tracking",
              },
              {
                icon: Receipt,
                name: "Invoices",
                description: "Automated invoicing and payment tracking",
              },
              {
                icon: Boxes,
                name: "Wholesale",
                description: "Manage supplier orders and inventory",
              },
              {
                icon: Wrench,
                name: "Production",
                description: "Schedule and track production timelines",
              },
              {
                icon: Truck,
                name: "Delivery",
                description: "Plan and manage delivery schedules",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.name} className="bg-white rounded-lg p-6 border border-gray-200">
                  <Icon className="text-accent-pink mb-4" size={32} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-light-pink">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-green mb-4">
              Why Choose Petal & Prosper?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by florists, for florists
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Save hours of administration every week",
              "Never lose an enquiry or order again",
              "Professional proposals and invoices",
              "Built-in pricing calculator",
              "Real-time order status tracking",
              "Customisable settings for your business",
              "Secure cloud-based storage",
              "Mobile-friendly interface",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-4">
                <CheckCircle className="text-light-green flex-shrink-0" size={24} />
                <p className="text-lg text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-green mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Essential",
                price: "£39",
                description: "Perfect for getting started",
                features: [
                  "Up to 50 orders per month",
                  "Basic enquiry tracking",
                  "Simple order management",
                  "Email support",
                ],
              },
              {
                name: "Growth",
                price: "£79",
                description: "For growing businesses",
                features: [
                  "Up to 500 orders per month",
                  "Advanced enquiry management",
                  "Full order and proposal features",
                  "Priority email support",
                  "Custom pricing settings",
                  "Production scheduling",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large operations",
                features: [
                  "Unlimited orders",
                  "All Growth features",
                  "Wholesale management",
                  "Multi-user accounts",
                  "Phone support",
                  "Custom integrations",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg border-2 p-8 ${
                  plan.highlighted
                    ? "border-primary-green bg-primary-green text-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={plan.highlighted ? "text-soft-cream mb-4" : "text-gray-600 mb-4"}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.name !== "Enterprise" && (
                    <span className={plan.highlighted ? "text-soft-cream" : "text-gray-600"}>
                      /month
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle
                        className={plan.highlighted ? "text-soft-cream" : "text-light-green"}
                        size={20}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "secondary" : "primary"}
                  className="w-full"
                >
                  Get started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-20 px-4 sm:px-6 lg:px-8 bg-light-pink">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-green mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Is there a free trial?",
                answer:
                  "Yes! We offer a 14-day free trial of the Growth plan. No credit card required.",
              },
              {
                question: "Can I change plans later?",
                answer:
                  "Of course. You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.",
              },
              {
                question: "How do I export my data?",
                answer:
                  "You can export your orders, enquiries, and invoices in CSV format at any time from your settings.",
              },
              {
                question: "Is my data secure?",
                answer:
                  "Yes, we use industry-standard encryption and comply with GDPR. Your data is backed up automatically.",
              },
              {
                question: "Do you offer integrations?",
                answer:
                  "We support integrations with popular accounting and CRM platforms. Enterprise plans can access custom integrations.",
              },
            ].map((faq) => (
              <div key={faq.question} className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary-green text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to streamline your floristry business?
          </h2>
          <p className="text-lg text-soft-cream mb-8">
            Join hundreds of florists using Petal & Prosper to manage their
            businesses more efficiently.
          </p>

          <Link href="/signup">
            <Button variant="secondary" size="lg">
              Start your free trial
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
