import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { ProductList, ProductForm } from "@/components/products";

const ProductsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { pathname } = useLocation();

  if (pathname === "/products/new" || id) return <ProductForm />;
  return <ProductList />;
};

export default ProductsPage;
