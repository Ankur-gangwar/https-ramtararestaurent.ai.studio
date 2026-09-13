const fs = require('fs');
const file = 'src/data/initialData.ts';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(
  /export const DEFAULT_USERS: \(User & \{ password: string \}\)\[\] = \[.*?\];/s,
  `export const DEFAULT_USERS: (User & { password: string })[] = [
  { id: 1, username: '7599791753', name: 'Ankur gangwar', password: 'ankur7755', role: 'Admin' },
  { id: 2, username: 'manager', name: 'Restaurant Manager', password: 'manager123', role: 'Manager' },
  { id: 3, username: 'cashier', name: 'POS Cashier', password: 'cashier123', role: 'Cashier' },
  { id: 4, username: 'waiter', name: 'Floor Waiter', password: 'waiter123', role: 'Waiter' },
  { id: 5, username: 'kitchen', name: 'Kitchen Head', password: 'kitchen123', role: 'Kitchen' }
];`
);
fs.writeFileSync(file, data);
