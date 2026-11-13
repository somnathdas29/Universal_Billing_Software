import React from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { InventoryView } from '../InventoryView';

export default function InventoryIsland() {
  const {
    company,
    products,
    addProduct,
    updateProduct,
  } = useBillingStorage();

  return (
    <InventoryView
      products={products}
      company={company}
      onAddProduct={addProduct}
      onUpdateProduct={updateProduct}
    />
  );
}
