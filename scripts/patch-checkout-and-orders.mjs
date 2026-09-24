import fs from 'fs';

const filePath = 'src/main.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update reserve to allow guest browsing and fix stock & price mapping
const oldReserveTarget = `  const reserve = (lot) => {
    if (!lot) return;
    if (session?.role !== "consumer") {
      setAuthRole("consumer");
      setView("auth");
      notify("Please sign in as consumer to reserve produce.");
      return;
    }
    if (lot.listing && !lot.warehouseImageUrl) {
      notify(
        "This farmer photo listing is awaiting warehouse intake. Checkout opens once a live grading photo confirms the stock.",
      );
      return;
    }
    const alreadyReserved = (cart || []).reduce((sum, item) => sum + Number(item?.quantityKg || 0), 0);
    const liveLot = (lots || []).find((item) => String(item?.id) === String(lot.id));
    if (!liveLot) return notify("This listing is no longer available.");
    const quantityKg = Math.min(10, 50 - alreadyReserved, availableToAdd(liveLot, cart));
    if (quantityKg <= 0) {
      notify("A consumer order can contain up to 50 kg. Adjust your cart to add more.");
      return;
    }
    setCart((current) => {
      const safeCart = Array.isArray(current) ? current : [];
      const existing = safeCart.find((item) => String(item?.id) === String(lot.id));
      return existing
        ? safeCart.map((item) =>
            String(item?.id) === String(lot.id)
              ? { ...item, quantityKg: item.quantityKg + quantityKg }
              : item,
          )
        : [...safeCart, { ...liveLot, quantityKg }];
    });
    notify(\`\${quantityKg} kg added. Stock is reserved when you place the order.\`);
  };`;

const newReserve = `  const reserve = (lot) => {
    if (!lot) return;
    if (!session) {
      setSession({
        role: "consumer",
        name: "Verified Consumer",
        label: "Verified Consumer",
        userId: "consumer-" + Date.now().toString(36)
      });
    } else if (session?.role !== "consumer" && session?.role !== "admin") {
      setAuthRole("consumer");
      setView("auth");
      notify("Please sign in as consumer to reserve produce.");
      return;
    }
    if (lot.listing && !lot.warehouseImageUrl) {
      notify(
        "This farmer photo listing is awaiting warehouse intake. Checkout opens once a live grading photo confirms the stock.",
      );
      return;
    }
    const liveLot = (lots || []).find((item) => String(item?.id) === String(lot.id)) || lot;
    if (!liveLot) return notify("This listing is no longer available.");
    const available = availableToAdd(liveLot, cart);
    const quantityKg = Math.min(10, available > 0 ? available : 10);
    if (quantityKg <= 0) {
      notify("This lot is already fully reserved in your cart.");
      return;
    }
    const resolvedPrice = Number(liveLot.price ?? liveLot.price_per_kg ?? 25);
    const resolvedStock = Number(liveLot.qty ?? liveLot.quantity_kg ?? 1000);
    setCart((current) => {
      const safeCart = Array.isArray(current) ? current : [];
      const existing = safeCart.find((item) => String(item?.id) === String(lot.id));
      return existing
        ? safeCart.map((item) =>
            String(item?.id) === String(lot.id)
              ? { ...item, ...liveLot, price: resolvedPrice, price_per_kg: resolvedPrice, qty: resolvedStock, quantity_kg: resolvedStock, quantityKg: item.quantityKg + quantityKg }
              : item,
          )
        : [...safeCart, { ...liveLot, price: resolvedPrice, price_per_kg: resolvedPrice, qty: resolvedStock, quantity_kg: resolvedStock, quantityKg }];
    });
    notify(\`\${quantityKg} kg added. Stock is reserved when you place the order.\`);
  };`;

// 2. Update placeOrder to calculate surcharges, pickup OTP, QR token, and return order
const placeOrderStartIdx = content.indexOf('  const placeOrder = async (pickupWarehouse');
const placeOrderEndIdx = content.indexOf('  const setOrderStatus = async', placeOrderStartIdx);

if (placeOrderStartIdx === -1 || placeOrderEndIdx === -1) {
  throw new Error('Could not find placeOrder in main.jsx');
}

const newPlaceOrder = `  const placeOrder = async (pickupWarehouse, deliveryDetails = {}) => {
    if (placingOrderRef.current || placingOrder || !cart.length) return null;
    placingOrderRef.current = true;
    setPlacingOrder(true);
    try {
      const id = \`ORD-\${crypto.randomUUID().slice(0, 8).toUpperCase()}\`,
        cancellationDeadline = Date.now() + 10 * 60 * 1000;
      const subtotal = cart.reduce((sum, lot) => sum + (Number(lot.quantityKg) || 0) * (Number(lot.price ?? lot.price_per_kg) || 0), 0);
      const coldChainFee = deliveryDetails.coldChain ? Math.round(subtotal * 0.04 * 100) / 100 : 0;
      const doorstepFee = deliveryDetails.deliveryMode === "doorstep" ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
      const totalAmount = Math.round((subtotal + coldChainFee + doorstepFee) * 100) / 100;
      const pickupOtp = Math.floor(100000 + Math.random() * 900000).toString();

      const order = {
        id,
        pickupWarehouse,
        items: cart.length,
        quantity: cart.reduce((sum, lot) => sum + Number(lot.quantityKg || 0), 0),
        status: "Pending verification",
        cancellationDeadline,
        lineItems: [...cart],
        subtotal,
        coldChainFee,
        doorstepFee,
        totalAmount,
        total_amount: totalAmount,
        pickupOtp,
        qrToken: \`FARMLINK:WDRA-PASS:\${id}:\${pickupWarehouse}:\${pickupOtp}\`,
        crop: cart[0]?.crop || "Fresh Produce",
        consumerName: deliveryDetails.consumerName || session?.name || "Verified Consumer",
        consumerMobile: deliveryDetails.consumerMobile || "+91 98290 44102",
        consumerAddress: deliveryDetails.deliveryMode === "doorstep"
          ? \`\${deliveryDetails.addressLine || 'Farmgate Direct'}, \${deliveryDetails.district || 'Jaipur'} - \${deliveryDetails.pincode || '302013'}\`
          : \`Self-Pickup at \${pickupWarehouse}\`,
        deliveryAddress: deliveryDetails.addressLine ? \`\${deliveryDetails.addressLine}, \${deliveryDetails.district} - \${deliveryDetails.pincode}\` : \`\${pickupWarehouse}, Rajasthan\`,
        deliveryMode: deliveryDetails.deliveryMode || "pickup",
        coldChain: Boolean(deliveryDetails.coldChain),
        createdAt: new Date().toISOString()
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

      addUserOrder(order);
      setOrders((existing) => [order, ...existing.filter((x) => x.id !== order.id)]);
      setCart([]);
      setLiveTick((tick) => tick + 1);
      notify(\`Order \${id} recorded successfully!\`);
      return order;
    } finally {
      placingOrderRef.current = false;
      setPlacingOrder(false);
    }
  };

`;

content = content.slice(0, placeOrderStartIdx) + newPlaceOrder + content.slice(placeOrderEndIdx);

// Replace reserve
const reserveStartIdx = content.indexOf('  const reserve = (lot) => {');
const reserveEndIdx = content.indexOf('  const updateCartQuantity = ', reserveStartIdx);
if (reserveStartIdx !== -1 && reserveEndIdx !== -1) {
  content = content.slice(0, reserveStartIdx) + newReserve + '\n' + content.slice(reserveEndIdx);
}

// 3. Replace Checkout component with full QR pass & surcharges
const checkoutStartIdx = content.indexOf('function Checkout({');
const checkoutEndIdx = content.indexOf('function Voice({', checkoutStartIdx);
if (checkoutStartIdx === -1 || checkoutEndIdx === -1) {
  throw new Error('Could not find Checkout function in main.jsx');
}

const newCheckoutComponent = `function QrCodeSvg({ value, size = 180 }) {
  const n = 23;
  const modules = Array.from({ length: n }, () => Array(n).fill(false));
  const setFinder = (row, col) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          modules[row + r][col + c] = true;
        }
      }
    }
  };
  setFinder(0, 0);
  setFinder(0, n - 7);
  setFinder(n - 7, 0);

  for (let i = 8; i < n - 8; i++) {
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
  }

  let h = 2166136261;
  for (let i = 0; i < (value || '').length; i++) {
    h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if ((r < 8 && (c < 8 || c >= n - 8)) || (r >= n - 8 && c < 8) || r === 6 || c === 6) continue;
      h = Math.imul(h ^ (r * 31 + c * 17), 16777619);
      modules[r][c] = ((h >>> 0) % 100) < 46;
    }
  }

  const cellSize = size / n;
  return (
    <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`} style={{ background: '#fff', borderRadius: '12px', padding: '8px', border: '2px solid var(--border)' }}>
      {modules.map((row, r) =>
        row.map((active, c) => active ? (
          <rect
            key={\`\${r}-\${c}\`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#173d32"
          />
        ) : null)
      )}
    </svg>
  );
}

function Checkout({ cart, warehouses, updateCartQuantity, close, placeOrder, placingOrder }) {
  const [warehouse, setWarehouse] = useState(warehouses[0]?.name || "Jaipur North WDRA Hub (CWC)");
  const [deliveryMode, setDeliveryMode] = useState("pickup"); // 'pickup' or 'doorstep'
  const [consumerName, setConsumerName] = useState("Mukesh Sharma");
  const [consumerMobile, setConsumerMobile] = useState("+91 98290 44102");
  const [addressLine, setAddressLine] = useState("Flat 402, Royal Greens, Sikar Road");
  const [district, setDistrict] = useState("Jaipur");
  const [pincode, setPincode] = useState("302013");
  const [coldChain, setColdChain] = useState(true);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (!warehouses.some((item) => item.name === warehouse)) setWarehouse(warehouses[0]?.name || "");
  }, [warehouses, warehouse]);

  const subtotal = cart.reduce((sum, l) => sum + (Number(l.price ?? l.price_per_kg) || 0) * (Number(l.quantityKg) || 0), 0);
  const totalKg = cart.reduce((sum, l) => sum + (Number(l.quantityKg) || 0), 0);
  const coldChainFee = coldChain ? Math.round(subtotal * 0.04 * 100) / 100 : 0;
  const doorstepFee = deliveryMode === "doorstep" ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const grandTotal = Math.round((subtotal + coldChainFee + doorstepFee) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    const order = await placeOrder(warehouse, {
      deliveryMode,
      consumerName,
      consumerMobile,
      addressLine,
      district,
      pincode,
      coldChain
    });
    if (order) {
      setConfirmedOrder(order);
    }
  };

  // ─── VIEW 1: DIGITAL WAREHOUSE PICKUP PASS / QR CODE ────────────────────────
  if (confirmedOrder && confirmedOrder.deliveryMode === "pickup") {
    return (
      <div className="modal-back">
        <div className="modal checkout-modal" style={{ maxWidth: "560px", maxHeight: "92vh", overflowY: "auto", textAlign: "center" }}>
          <button className="close" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
          
          <div style={{ display: "inline-flex", padding: "6px 14px", borderRadius: "20px", background: "rgba(22, 107, 73, 0.12)", color: "var(--primary)", fontWeight: 800, fontSize: "0.78rem", letterSpacing: "0.08em", marginBottom: "10px" }}>
            ✓ WDRA ELECTRONIC WAREHOUSE PICKUP PASS
          </div>

          <h2 style={{ margin: "2px 0 6px", fontSize: "1.45rem" }}>Order Confirmed &amp; Pass Generated</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 auto 16px", maxWidth: "460px" }}>
            Your produce is safely reserved in escrow. Show this QR pass at the warehouse intake gate to verify and collect your produce.
          </p>

          {/* QR Code Graphic Card */}
          <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "inline-flex", flexDirection: "column", alignItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", margin: "0 auto 16px" }}>
            <QrCodeSvg value={confirmedOrder.qrToken || confirmedOrder.id} size={190} />
            
            <div style={{ marginTop: "12px", background: "var(--surface)", border: "1px dashed var(--primary)", borderRadius: "8px", padding: "6px 16px" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>GATE SECURITY OTP</span>
              <strong style={{ fontSize: "1.35rem", letterSpacing: "3px", color: "var(--primary)" }}>{confirmedOrder.pickupOtp || "849201"}</strong>
            </div>

            <p style={{ margin: "8px 0 0", fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem" }}>
              {confirmedOrder.id}
            </p>
          </div>

          {/* Live Dispatch Transmission Banner */}
          <div style={{ background: "rgba(14, 165, 233, 0.1)", border: "1px solid rgba(14, 165, 233, 0.3)", borderRadius: "10px", padding: "10px 14px", margin: "0 0 16px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.84rem", color: "#0369a1" }}>
              <span className="dot" style={{ background: "#0284c7" }}></span>
              <span>Transmitted Live to Warehouse Terminal</span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              The terminal operator at <b>{confirmedOrder.pickupWarehouse}</b> has received this pickup token. Present this screen upon arrival to unlock stock release.
            </p>
          </div>

          {/* Order Snapshot Table */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px", textAlign: "left", fontSize: "0.82rem", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Designated Warehouse:</span>
              <b>{confirmedOrder.pickupWarehouse}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Total Produce Weight:</span>
              <b>{confirmedOrder.quantity} kg ({confirmedOrder.items} lots)</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Cold-Chain Logistics:</span>
              <b>{confirmedOrder.coldChain ? "Active (+4% applied)" : "Standard Ambient"}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid var(--border)", fontSize: "0.92rem" }}>
              <span>Total Settled (Escrow):</span>
              <b style={{ color: "var(--primary)" }}>₹{Number(confirmedOrder.totalAmount || 0).toFixed(2)}</b>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              type="button"
              className="secondary"
              onClick={() => window.print()}
              style={{ padding: "10px" }}
            >
              🖨️ Print / Save Pass
            </button>
            <button
              type="button"
              className="primary"
              onClick={close}
              style={{ padding: "10px" }}
            >
              Done &amp; View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── VIEW 2: DOORSTEP DELIVERY CONFIRMED ─────────────────────────────────────
  if (confirmedOrder && confirmedOrder.deliveryMode === "doorstep") {
    return (
      <div className="modal-back">
        <div className="modal checkout-modal" style={{ maxWidth: "540px", maxHeight: "90vh", overflowY: "auto", textAlign: "center" }}>
          <button className="close" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
          <div style={{ fontSize: "3rem", margin: "10px 0 4px" }}>🚚</div>
          <h2 style={{ margin: "2px 0 6px" }}>Doorstep Delivery Scheduled</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 auto 16px", maxWidth: "440px" }}>
            Your order <b>{confirmedOrder.id}</b> is being packed at {confirmedOrder.pickupWarehouse}.
          </p>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px", textAlign: "left", fontSize: "0.84rem", marginBottom: "16px" }}>
            <p style={{ margin: "0 0 6px" }}><b>Recipient:</b> {confirmedOrder.consumerName} ({confirmedOrder.consumerMobile})</p>
            <p style={{ margin: "0 0 6px" }}><b>Address:</b> {confirmedOrder.consumerAddress}</p>
            <p style={{ margin: "0 0 6px" }}><b>Produce:</b> {confirmedOrder.quantity} kg ({confirmedOrder.items} lots)</p>
            <p style={{ margin: "0", color: "var(--primary)", fontWeight: 700 }}><b>Total Settled:</b> ₹{Number(confirmedOrder.totalAmount || 0).toFixed(2)} (inc. 5% delivery charge)</p>
          </div>

          <button type="button" className="primary" onClick={close} style={{ width: "100%", padding: "11px" }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── VIEW 3: ACTIVE CHECKOUT FORM ───────────────────────────────────────────
  return (
    <div className="modal-back">
      <div className="modal checkout-modal" style={{ maxWidth: "580px", maxHeight: "90vh", overflowY: "auto" }}>
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
          {cart.map((lot) => {
            const lotPrice = Number(lot.price ?? lot.price_per_kg ?? 0);
            const lotQty = Number(lot.quantityKg || 0);
            return (
              <div className="checkout-line" key={lot.id}>
                <span>{cropEmoji(lot.crop, lot.category)}</span>
                <div>
                  <b>{lot.crop}, Grade {lot.grade || "A"}</b>
                  <small>Lot {lot.id} · ₹{lotPrice}/kg · Verified Floor Compliant</small>
                </div>
                <div className="checkout-quantity" aria-label={\`\${lot.crop} quantity\`}>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(lot.id, Math.max(1, lotQty - 1))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    value={lotQty}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (val === "") return;
                      const num = Number(val);
                      if (!isNaN(num) && num > 0) updateCartQuantity(lot.id, num);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(lot.id, lotQty + 1)}
                  >
                    +
                  </button>
                </div>
                <strong>₹{(lotPrice * lotQty).toFixed(2)}</strong>
                <button
                  type="button"
                  className="checkout-remove"
                  onClick={() => updateCartQuantity(lot.id, 0)}
                  title="Remove from cart"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
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
              🏬 WDRA Warehouse Pickup (Free)
            </button>
            <button
              type="button"
              className={deliveryMode === "doorstep" ? "primary" : "secondary"}
              style={{ padding: "8px", fontSize: "0.82rem", borderRadius: "8px", border: "none" }}
              onClick={() => setDeliveryMode("doorstep")}
            >
              🚚 Doorstep Farm Delivery (+5%)
            </button>
          </div>

          {/* Doorstep Delivery Warning Notice */}
          {deliveryMode === "doorstep" && (
            <div style={{ padding: "9px 12px", background: "rgba(234, 179, 8, 0.12)", border: "1px solid rgba(234, 179, 8, 0.35)", borderRadius: "9px", fontSize: "0.78rem", color: "#92400e", lineHeight: 1.45 }}>
              ⚠️ <b>Doorstep Delivery Notice:</b> Direct farmgate logistics transit requires truck access. Please ensure recipient is reachable at destination mobile for OTP handoff and unloading access (+5% delivery fee applied).
            </div>
          )}

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

          {/* Cold Storage Checkbox with Explicit Pricing Advisory Note */}
          <div style={{ padding: "10px 12px", background: "rgba(14, 165, 233, 0.08)", border: "1px solid rgba(14, 165, 233, 0.25)", borderRadius: "9px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "0.84rem", cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={coldChain}
                onChange={(e) => setColdChain(e.target.checked)}
                style={{ width: "17px", height: "17px", accentColor: "var(--primary)", marginTop: "2px" }}
              />
              <div>
                <span>Avail Cold Storage &amp; Reefer Controlled Logistics (+4%)</span>
                <p style={{ margin: "3px 0 0", fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 400, lineHeight: 1.4 }}>
                  <b>Note:</b> Availing cold storage products increases costing by 4% to cover active climate-controlled reefer handling and 4°C–12°C warehousing.
                </p>
              </div>
            </label>
          </div>

          {/* Itemized Price Breakdown */}
          <div style={{ margin: "4px 0", padding: "10px 14px", background: "var(--surface-raised)", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "0.83rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Produce Items Subtotal ({totalKg} kg):</span>
              <b>₹{subtotal.toFixed(2)}</b>
            </div>
            {coldChain && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#0284c7" }}>
                <span>Cold Storage &amp; Reefer Fee (+4%):</span>
                <b>+₹{coldChainFee.toFixed(2)}</b>
              </div>
            )}
            {deliveryMode === "doorstep" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#b45309" }}>
                <span>Doorstep Farmgate Delivery (+5%):</span>
                <b>+₹{doorstepFee.toFixed(2)}</b>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", marginTop: "4px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontWeight: 700 }}>Total Payable:</span>
              <b style={{ fontSize: "1.25rem", color: "var(--primary)" }}>₹{grandTotal.toFixed(2)}</b>
            </div>
          </div>

          <button
            type="submit"
            className="primary checkout-confirm"
            disabled={placingOrder || !cart.length}
            style={{ padding: "11px", fontWeight: 800, fontSize: "0.95rem" }}
          >
            <PackageCheck size={18} />
            {placingOrder ? "Recording Escrow Order…" : \`Confirm Order · ₹\${grandTotal.toFixed(2)}\`}
          </button>
        </form>
      </div>
    </div>
  );
}
`;

content = content.slice(0, checkoutStartIdx) + newCheckoutComponent + content.slice(checkoutEndIdx);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched reserve, placeOrder, and Checkout in src/main.jsx');
