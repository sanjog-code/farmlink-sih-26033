import fs from 'fs';

let content = fs.readFileSync('src/main.jsx', 'utf8');
const isCrlf = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

const needle = 'title="Consumer pickup orders"';
const idx = norm.indexOf(needle);
if (idx === -1) {
  console.error('Needle not found');
  process.exit(1);
}

const queueStart = norm.lastIndexOf('<QueuePanel', idx);
const queueEnd = norm.indexOf('/>', idx) + 2;

const replacement = `<QueuePanel
          title="WDRA Electronic QR Handoff &amp; Consumer Pickup Terminal"
          empty="No pickup orders waiting at warehouse."
          items={orders}
          render={(o) => (
            <>
              <b>
                {o.id} · {o.quantity} kg {o.pickupOtp ? \`· Gate OTP: \${o.pickupOtp}\` : ""}
              </b>
              <small>
                {o.consumerName || "Consumer"}{o.consumerMobile ? \` · \${o.consumerMobile}\` : ""} · {o.pickupWarehouse} · {o.items} lot(s) · {o.coldChain ? "❄️ Cold-Chain (+4%)" : "Ambient"} · <strong style={{ color: String(o.status).toLowerCase() === 'completed' ? '#166534' : 'var(--primary)' }}>{o.status}</strong>
              </small>
            </>
          )}
          action={(order) => (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {String(order.status).toLowerCase() === 'pending verification' && (
                <button
                  className="queue-action"
                  onClick={async () => {
                    if (await setOrderStatus(order.id, 'Ready for pickup')) {
                      notify(\`\${order.id} marked ready for consumer pickup.\`);
                    }
                  }}
                >
                  Pack for Pickup
                </button>
              )}
              {String(order.status).toLowerCase() !== 'completed' && (
                <button
                  className="queue-action"
                  style={{ background: '#166534', color: '#fff', border: 'none' }}
                  onClick={async () => {
                    if (await setOrderStatus(order.id, 'Completed')) {
                      notify(\`Produce for \${order.id} verified and handed over! Escrow settled.\`);
                    }
                  }}
                >
                  ✓ Scan QR &amp; Handover Produce
                </button>
              )}
              {String(order.status).toLowerCase() === 'completed' && (
                <span style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 700 }}>
                  ✓ Handed over
                </span>
              )}
            </div>
          )}
        />`;

norm = norm.slice(0, queueStart) + replacement + norm.slice(queueEnd);
fs.writeFileSync('src/main.jsx', isCrlf ? norm.replace(/\n/g, '\r\n') : norm, 'utf8');
console.log('Successfully updated WarehouseView QueuePanel with QR Handoff Scanner');
