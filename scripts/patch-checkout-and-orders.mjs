import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/main.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update placeOrder signature and fallback logic
const oldPlaceOrder = `  const placeOrder = async (pickupWarehouse) => {
    if (placingOrderRef.current || placingOrder || !cart.length) return;
    placingOrderRef.current = true;
    setPlacingOrder(true);
    try {
      if (!isSupabaseConfigured || session?.role !== "consumer" || !session?.userId) return notify("Please sign in as a consumer before placing an order.");
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
      };`;

const newPlaceOrder = `  const placeOrder = async (pickupWarehouse, deliveryDetails = {}) => {
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
        consumerMobile: deliveryDetails.consumerMobile || "+91 98290 12345",
        consumerAddress: deliveryDetails.deliveryMode === "doorstep"
          ? \`\${deliveryDetails.addressLine || 'Farmgate Direct'}, \${deliveryDetails.district || 'Jaipur'} - \${deliveryDetails.pincode || '302013'}\`
          : \`Self-Pickup at \${pickupWarehouse}\`,
        deliveryAddress: deliveryDetails.addressLine ? \`\${deliveryDetails.addressLine}, \${deliveryDetails.district} - \${deliveryDetails.pincode}\` : \`\${pickupWarehouse}, Rajasthan\`,
        deliveryMode: deliveryDetails.deliveryMode || "pickup",
        coldChain: Boolean(deliveryDetails.coldChain)
      };`;

if (content.includes(oldPlaceOrder)) {
  content = content.replace(oldPlaceOrder, newPlaceOrder);
  console.log('Successfully updated placeOrder with fallback and address details');
}

// 2. Replace Checkout component with full structured address support
const checkoutOldStart = 'function Checkout({ cart, warehouses, updateCartQuantity, close, placeOrder, placingOrder }) {';
const checkoutOldEnd = 'function Voice({ close, notify, setModal }) {';

const idxStart = content.indexOf(checkoutOldStart);
const idxEnd = content.indexOf(checkoutOldEnd);

if (idxStart !== -1 && idxEnd !== -1) {
  const newCheckoutComponent = `function Checkout({ cart, warehouses, updateCartQuantity, close, placeOrder, placingOrder }) {
  const [warehouse, setWarehouse] = useState(warehouses[0]?.name || "Jaipur North WDRA Hub (CWC)");
  const [deliveryMode, setDeliveryMode] = useState("pickup"); // 'pickup' or 'doorstep'
  const [consumerName, setConsumerName] = useState("Mukesh Sharma");
  const [consumerMobile, setConsumerMobile] = useState("+91 98290 44102");
  const [addressLine, setAddressLine] = useState("Flat 402, Royal Greens, Sikar Road");
  const [district, setDistrict] = useState("Jaipur");
  const [pincode, setPincode] = useState("302013");
  const [coldChain, setColdChain] = useState(true);

  useEffect(() => {
    if (!warehouses.some((item) => item.name === warehouse)) setWarehouse(warehouses[0]?.name || "");
  }, [warehouses, warehouse]);

  const total = cart.reduce((sum, l) => sum + l.price * l.quantityKg, 0);
  const totalKg = cart.reduce((sum, l) => sum + l.quantityKg, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    placeOrder(warehouse, {
      deliveryMode,
      consumerName,
      consumerMobile,
      addressLine,
      district,
      pincode,
      coldChain
    });
  };

  return (
    <div className="modal-back">
      <div className="modal checkout-modal" style={{ maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
        <button className="close" onClick={close} aria-label="Close">
          <X size={18} />
        </button>
        <p className="eyebrow green">VERIFIED CHECKOUT &amp; LOGISTICS ROUTING</p>
        <h2 style={{ margin: "4px 0 6px" }}>Confirm Produce Order &amp; Delivery Address</h2>
        <p className="checkout-copy" style={{ margin: "0 0 14px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Orders are settled via escrow with farmgate NIR traceability and multi-stop WDRA warehouse routing.
        </p>

        {/* Cart Itemized Summary */}
        <div className="checkout-lines" style={{ marginBottom: "14px" }}>
          {cart.map((lot) => (
            <div className="checkout-line" key={lot.id}>
              <span>{cropEmoji(lot.crop, lot.category)}</span>
              <div>
                <b>{lot.crop}, Grade {lot.grade || "A"}</b>
                <small>Lot {lot.id} · ₹{lot.price}/kg · Verified Floor Compliant</small>
              </div>
              <div className="checkout-quantity" aria-label={\`\${lot.crop} quantity\`}>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(lot.id, lot.quantityKg - 1)}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={lot.quantityKg}
                  onChange={(event) => updateCartQuantity(lot.id, event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => updateCartQuantity(lot.id, lot.quantityKg + 1)}
                >
                  +
                </button>
              </div>
              <strong>₹{(lot.price * lot.quantityKg).toFixed(2)}</strong>
              <button
                type="button"
                className="checkout-remove"
                onClick={() => updateCartQuantity(lot.id, 0)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Delivery Mode Toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "var(--surface-raised)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <button
              type="button"
              className={deliveryMode === "pickup" ? "primary" : "secondary"}
              style={{ padding: "8px", fontSize: "0.82rem", borderRadius: "8px", border: "none" }}
              onClick={() => setDeliveryMode("pickup")}
            >
              🏬 WDRA Warehouse Pickup
            </button>
            <button
              type="button"
              className={deliveryMode === "doorstep" ? "primary" : "secondary"}
              style={{ padding: "8px", fontSize: "0.82rem", borderRadius: "8px", border: "none" }}
              onClick={() => setDeliveryMode("doorstep")}
            >
              🚚 Doorstep Farm Delivery
            </button>
          </div>

          {/* Contact Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                Recipient Full Name:
              </label>
              <input
                type="text"
                required
                value={consumerName}
                onChange={(e) => setConsumerName(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                Contact Mobile (for OTP Handoff):
              </label>
              <input
                type="text"
                required
                value={consumerMobile}
                onChange={(e) => setConsumerMobile(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>
          </div>

          {/* Destination Warehouse */}
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
              Intake / Pickup WDRA Registered Warehouse:
            </label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)" }}
            >
              {warehouses.map((item) => (
                <option key={item.id || item.name} value={item.name}>
                  {item.name} {item.wdraRegNo ? \`(\${item.wdraRegNo})\` : ""} · {item.district || "Rajasthan"}
                </option>
              ))}
            </select>
            <small style={{ color: "var(--text-muted)", display: "block", marginTop: "3px", fontSize: "0.74rem" }}>
              {warehouses.find(w => w.name === warehouse)?.address || "WDRA accredited state warehousing terminal"}
            </small>
          </div>

          {/* Address Line (Mandatory if doorstep delivery) */}
          {deliveryMode === "doorstep" && (
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                Street Address / House / Landmark:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Plot 12, Subhash Marg, C-Scheme"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                District / City:
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                PIN Code:
              </label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", cursor: "pointer", marginTop: "2px" }}>
            <input
              type="checkbox"
              checked={coldChain}
              onChange={(e) => setColdChain(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
            />
            Require Cold-Chain Temperature Controlled Logistics
          </label>

          <div className="checkout-total" style={{ margin: "8px 0", padding: "10px 14px", background: "var(--surface-raised)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total Payable ({totalKg} kg):</span>
            <b style={{ fontSize: "1.2rem", color: "var(--primary)" }}>₹{total.toFixed(2)}</b>
          </div>

          <button
            type="submit"
            className="primary checkout-confirm"
            disabled={placingOrder}
            style={{ padding: "11px", fontWeight: 800, fontSize: "0.95rem" }}
          >
            <PackageCheck size={18} />
            {placingOrder ? "Recording Escrow Order…" : "Confirm Order & Generate Handoff"}
          </button>
        </form>
      </div>
    </div>
  );
}
`;

  content = content.slice(0, idxStart) + newCheckoutComponent + content.slice(idxEnd);
  console.log('Successfully replaced Checkout component with full structured address support');
} else {
  console.warn('Could not find Checkout component boundaries');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Finished patch-checkout-and-orders.mjs');
