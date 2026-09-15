export type ProductOrderItemInput = {
  product_public_id: string;
  variant_public_id?: string;
  quantity: number;
};

export type CreateProductOrderInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  payment_method: string;
  delivery_method: string;
  delivery_province: string;
  delivery_district: string;
  delivery_sector: string;
  delivery_street: string;
  delivery_instructions?: string;
  items: ProductOrderItemInput[];
};

export type ProductOrderResult = {
  public_id: string;
  order_number: string;
  status: string;
  payment_status: string;
  currency: string;
  subtotal: string;
  delivery_fee: string;
  total: string;
};
