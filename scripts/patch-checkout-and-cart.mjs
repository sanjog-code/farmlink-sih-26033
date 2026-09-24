import fs from 'fs';

let content = fs.readFileSync('src/main.jsx', 'utf8');

// 1. Update reserve function to allow guest consumers & correct lot.quantity_kg
console.log('1. Patching reserve function...');
const targetReserve = `  const reserve = (lot) => {
    if (!lot) return;
    if (session?.role !== "consumer") {
      setAuthRole("consumer");
      setView("auth");
      notify("Please sign in as consumer to reserve produce.");
      return;
    }`;

const newReserve = `  const reserve = (lot) => {
    if (!lot) return;
    if (session && session.role !== "consumer" && session.role !== "admin") {
      setAuthRole("consumer");
      setView("auth");
      notify("Please switch to consumer account to purchase produce.");
      return;
    }
    if (lot.listing && lot.status === "pending") {
      notify("This produce listing is awaiting warehouse intake verification.");
      return;
    }`;

content = content.replace(targetReserve, newReserve);

// 2. In reserve: ensure availableToAdd uses quantity_kg fallback and adds cleanly
const targetQuantityCalc = `    const quantityKg = Math.min(10, 50 - alreadyReserved, availableToAdd(liveLot, cart));
    if (quantityKg <= 0) {
      notify("A consumer order can contain up to 50 kg. Adjust your cart to add more.");
      return;
    }`;

const newQuantityCalc = `    const maxAvailable = Number(liveLot.qty ?? liveLot.quantity_kg ?? 1000);
    const available = Math.max(0, maxAvailable - alreadyReserved);
    const quantityKg = Math.min(10, 50 - alreadyReserved, available > 0 ? available : 10);
    if (quantityKg <= 0) {
      notify("A consumer order can contain up to 50 kg. Adjust your cart to add more.");
      return;
    }`;

content = content.replace(targetQuantityCalc, newQuantityCalc);

// 3. Update openCart to allow guest consumers
console.log('2. Patching openCart...');
const targetOpenCart = `  const openCart = () => {
    if (!session) return access("consumer", "consumer");
    if (session.role !== "consumer") return notify("The checkout cart is available only to consumer accounts.");
    if (!cart.length) { setView("market"); return notify("Your cart is empty. Add marketplace produce before checking out."); }
    setModal("checkout");
  };`;

const newOpenCart = `  const openCart = () => {
    if (!cart.length) { setView("market"); return notify("Your cart is empty. Add marketplace produce before checking out."); }
    setModal("checkout");
  };`;

content = content.replace(targetOpenCart, newOpenCart);

// 4. Update Marketplace top bar cart counter
console.log('3. Patching MarketplaceView cart counter...');
const targetMarketCheckout = `        <div className="checkout">
          <b>
            {(cart || []).length} items · {total || 0} kg
          </b>
          <button
            className="primary"
            disabled={!(cart || []).length}
            onClick={onCheckout}
          >
            Checkout
          </button>
        </div>`;

const newMarketCheckout = `        <div className="checkout">
          <b>
            {(cart || []).length} items · {(cart || []).reduce((s, item) => s + Number(item.quantityKg || 0), 0)} kg
          </b>
          <button
            className="primary"
            disabled={!(cart || []).length}
            onClick={onCheckout}
            style={{ fontWeight: 800 }}
          >
            Checkout (₹{(cart || []).reduce((s, item) => s + (Number(item.price || item.price_per_kg || 0) * Number(item.quantityKg || 0)), 0).toFixed(2)})
          </button>
        </div>`;

content = content.replace(targetMarketCheckout, newMarketCheckout);

fs.writeFileSync('src/main.jsx', content, 'utf8');
console.log('=== PART 1 CART & RESERVE PATCHED ===');
