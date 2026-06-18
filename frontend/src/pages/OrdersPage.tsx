import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { OrderList, OrderForm, OrderDetail } from "@/components/orders";

const OrdersPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { pathname } = useLocation();

  if (pathname === "/orders/new") return <OrderForm />;

  if (id) return <OrderDetail />;

  return <OrderList />;
};

export default OrdersPage;
