import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Header, Sidebar, Footer, ErrorBoundary } from "@/components/common";
import {
  HomePage,
  ProductsPage,
  CustomersPage,
  OrdersPage,
  NotFoundPage,
} from "@/pages";

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ErrorBoundary>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/new" element={<ProductsPage />} />
                <Route path="/products/:id/edit" element={<ProductsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/new" element={<CustomersPage />} />
                <Route path="/customers/:id/edit" element={<CustomersPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/new" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrdersPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#f8fafc" } },
          error: { iconTheme: { primary: "#f43f5e", secondary: "#f8fafc" } },
        }}
      />
    </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
