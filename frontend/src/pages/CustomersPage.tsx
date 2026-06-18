import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { CustomerList, CustomerForm } from "@/components/customers";

const CustomersPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { pathname } = useLocation();

  if (pathname === "/customers/new" || id) return <CustomerForm />;
  return <CustomerList />;
};

export default CustomersPage;
