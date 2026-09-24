import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/main.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const targetFunctionStart = '  const placeOrder = async (pickupWarehouse) => {';
const targetFunctionEnd = '      setCart([]);';

const idx1 = content.indexOf(targetFunctionStart);
const idx2 = content.indexOf(targetFunctionEnd, idx1);

if (idx1 !== -1 && idx2 !== -1) {
  const replacement = `  const placeOrder = async (pickupWarehouse, deliveryDetails = {}) => {
    if (placingOrderRef.current || placingOrder || !cart.length) return;
    placingOrderRef.current = true;
    setPlacingOrder(true);
    try {
      const id = \`ORD-\${crypto.randomUUID().slice(0, 12).toUpperCase()}\`,
        cancellationDeadline = Date.now() + 10 * 60 * 1000;
      const order = {
        id,
        pickupWarehouse,
        items: cart.length,
        quantity: cart.reduce((sum, lot) => sum + lot.quantityKg, 0),
        status: "Pending verification",
        cancellationDeadline,
        lineItems: cart,
        consumerName: deliveryDetails.consumerName || session?.name || "Verified Consumer",
        consumerMobile: deliveryDetails.consumerMobile || "+91 98290 44102",
        consumerAddress: deliveryDetails.deliveryMode === "doorstep"
          ? \`\${deliveryDetails.addressLine || 'Farmgate Direct'}, \${deliveryDetails.district || 'Jaipur'} - \${deliveryDetails.pincode || '302013'}\`
          : \`Self-Pickup at \${pickupWarehouse}\`,
        deliveryAddress: deliveryDetails.addressLine ? \`\${deliveryDetails.addressLine}, \${deliveryDetails.district} - \${deliveryDetails.pincode}\` : \`\${pickupWarehouse}, Rajasthan\`,
        deliveryMode: deliveryDetails.deliveryMode || "pickup",
        coldChain: Boolean(deliveryDetails.coldChain)
      };
      if (isSupabaseConfigured && session?.userId && session?.role === "consumer") {
        try {
          const { data: warehouse, error: warehouseError } = await supabase
            .from("warehouses")
            .select("id")
            .eq("name", pickupWarehouse)
            .single();
          if (!warehouseError && warehouse) {
            const items = cart.map((lot) => ({ lotId: lot.dbId, quantityKg: lot.quantityKg })).filter(i => i.lotId);
            if (items.length) {
              const { data: createdId } = await supabase.rpc("place_consumer_order", {
                p_order_code: id,
                p_warehouse_id: warehouse.id,
                p_items: items,
                p_cancellation_expires_at: new Date(cancellationDeadline).toISOString(),
              });
              if (createdId) order.dbId = createdId;
            }
          }
        } catch (err) {
          console.warn("Supabase placeOrder notice:", err);
        }
      }
      const totalAmount = cart.reduce((sum, lot) => sum + (Number(lot.quantityKg) || 0) * (Number(lot.price) || 0), 0);
      order.totalAmount = totalAmount;
      order.total_amount = totalAmount;
      order.crop = cart[0]?.crop || "Fresh Produce";
      addUserOrder(order);
      setOrders((existing) => [order, ...existing.filter((x) => x.id !== order.id)]);`;

  content = content.slice(0, idx1) + replacement + content.slice(idx2);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Successfully updated placeOrder with address capture and offline resilience');
} else {
  console.error('Could not locate placeOrder bounds in main.jsx');
}
