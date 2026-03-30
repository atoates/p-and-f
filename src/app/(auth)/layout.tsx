import { Flower } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-cream to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flower className="text-accent-pink" size={28} />
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-green">
              Petal & Prosper
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Floristry business management</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
