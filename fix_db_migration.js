const fs = require('fs');
let db = fs.readFileSync('shared/db.js', 'utf8');

// Add migration for drops
db = db.replace(
  /if \(!d\.createdAt\) \{/g,
  `if (d.retailPrice && d.retailPrice < 1000) { d.retailPrice = d.retailPrice * 1000; updated = true; }
        if (!d.createdAt) {`
);

// Add migration for orders
db = db.replace(
  /const orders = this\._get\(this\.KEYS\.ORDERS\);/g,
  `let orders = this._get(this.KEYS.ORDERS);
    if (orders && orders.length > 0) {
      let ordersUpdated = false;
      orders = orders.map(o => {
        if (o.price && o.price < 1000) { o.price = o.price * 1000; ordersUpdated = true; }
        return o;
      });
      if (ordersUpdated) this._set(this.KEYS.ORDERS, orders);
    }`
);

fs.writeFileSync('shared/db.js', db, 'utf8');
