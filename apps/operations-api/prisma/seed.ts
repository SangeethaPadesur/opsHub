import { PrismaClient, Role, OrderStatus, PaymentStatus, AlertSeverity } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const names = ["Rahul Sharma","Priya Verma","Amit Singh","Neha Gupta","Karan Mehta","Sneha Reddy"];
const products = [
  ["PROD-001","Laptop Stand","LAP-STAND","Accessories",2499],
  ["PROD-002","Wireless Keyboard","KEY-WL","Accessories",1999],
  ["PROD-003","Gaming Mouse","MOUSE-G","Accessories",1299],
  ["PROD-004","27-inch Monitor","MON-27","Electronics",15999],
  ["PROD-005","USB-C Hub","HUB-USBC","Accessories",2799]
] as const;
const warehouses = [
  ["BLR-01","Bangalore Warehouse","Bangalore"],
  ["MUM-01","Mumbai Warehouse","Mumbai"],
  ["DEL-01","Delhi Warehouse","Delhi"]
] as const;

async function main() {
  await prisma.refreshToken.deleteMany(); await prisma.refund.deleteMany(); await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany(); await prisma.inventory.deleteMany(); await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany(); await prisma.alert.deleteMany(); await prisma.featureFlag.deleteMany(); await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 10);
  await prisma.user.createMany({ data: [
    { id:"user-admin", name:"Admin User", email:"admin@opshub.dev", passwordHash, role:Role.ADMIN },
    { id:"user-manager", name:"Operations Manager", email:"manager@opshub.dev", passwordHash, role:Role.OPERATIONS_MANAGER },
    { id:"user-support", name:"Support Agent", email:"support@opshub.dev", passwordHash, role:Role.SUPPORT_AGENT },
    { id:"user-warehouse", name:"Warehouse Manager", email:"warehouse@opshub.dev", passwordHash, role:Role.WAREHOUSE_MANAGER }
  ]});
  for (const [id,name,sku,category,price] of products) await prisma.product.create({ data:{id,name,sku,category,price} });
  for (const [id,name,city] of warehouses) await prisma.warehouse.create({ data:{id,name,city} });
  for (const [pid] of products) for (const [wid] of warehouses)
    await prisma.inventory.create({ data:{ productId:pid, warehouseId:wid, quantity:Math.floor(Math.random()*150) } });

  const statuses = Object.values(OrderStatus), payments = Object.values(PaymentStatus);
  for (let i=1;i<=200;i++) {
    const id = `ORD-${String(1000+i).padStart(4,"0")}`;
    const p = products[i % products.length];
    const qty = 1 + (i % 3);
    await prisma.order.create({ data:{
      id, customerName:names[i%names.length], customerEmail:`customer${i}@example.com`,
      amount:p[4]*qty, status:statuses[i%statuses.length], paymentStatus:payments[i%payments.length],
      items:{create:[{name:p[1],sku:p[2],price:p[4],quantity:qty}]}
    }});
  }
  await prisma.alert.createMany({ data:[
    {title:"Payment gateway failure rate is high",message:"Failure rate exceeded threshold",severity:AlertSeverity.CRITICAL},
    {title:"Warehouse BLR-01 stock is critically low",message:"Multiple products require replenishment",severity:AlertSeverity.WARNING},
    {title:"High delivery delay in Mumbai region",message:"Carrier delays detected",severity:AlertSeverity.INFO}
  ]});
  await prisma.featureFlag.createMany({data:[
    {key:"new-refund-workflow",description:"Enable the redesigned refund flow",enabled:true},
    {key:"live-inventory-map",description:"Enable experimental inventory visualization",enabled:false}
  ]});
  console.log("Seed complete. Login: admin@opshub.dev / Password@123");
}
main().finally(()=>prisma.$disconnect());
