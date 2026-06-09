import { Server } from "socket.io";

const PORT = 3003;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track room state
const tableStates: Record<string, string> = {};
const orderStates: Record<string, any> = {};

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Join role-based rooms
  socket.on("join-role", (role: string) => {
    socket.join(`role:${role}`);
    console.log(`[Socket] ${socket.id} joined role:${role}`);
  });

  // Join specific station rooms
  socket.on("join-station", (station: string) => {
    socket.join(`station:${station}`);
    console.log(`[Socket] ${socket.id} joined station:${station}`);
  });

  // ===== TABLE EVENTS =====
  socket.on("table:status-change", (data: { tableId: string; status: string; updatedBy: string }) => {
    tableStates[data.tableId] = data.status;
    io.emit("table:status-updated", data);
    console.log(`[Socket] Table ${data.tableId} -> ${data.status}`);
  });

  // ===== ORDER EVENTS =====
  socket.on("order:created", (data: any) => {
    orderStates[data.id] = data;
    io.emit("order:updated", data);
    // Notify kitchen/bar stations
    if (data.items) {
      const kitchenItems = data.items.filter((i: any) => i.station === "KITCHEN");
      const barItems = data.items.filter((i: any) => i.station === "BAR");
      if (kitchenItems.length > 0) {
        io.to("station:KITCHEN").emit("kitchen:new-ticket", data);
      }
      if (barItems.length > 0) {
        io.to("station:BAR").emit("bar:new-ticket", data);
      }
    }
    console.log(`[Socket] Order created: ${data.id}`);
  });

  socket.on("order:item-status-change", (data: { orderId: string; itemId: string; status: string; station: string }) => {
    io.emit("order:item-updated", data);
    if (data.station === "KITCHEN") {
      io.to("station:KITCHEN").emit("kitchen:item-updated", data);
    } else if (data.station === "BAR") {
      io.to("station:BAR").emit("bar:item-updated", data);
    }
    console.log(`[Socket] Order item ${data.itemId} -> ${data.status}`);
  });

  socket.on("order:status-change", (data: { orderId: string; status: string }) => {
    io.emit("order:updated", { id: data.orderId, status: data.status });
    console.log(`[Socket] Order ${data.orderId} -> ${data.status}`);
  });

  // ===== RESERVATION EVENTS =====
  socket.on("reservation:updated", (data: any) => {
    io.emit("reservation:updated", data);
  });

  // ===== INVENTORY EVENTS =====
  socket.on("inventory:low-stock", (data: any) => {
    io.to("role:ADMIN").emit("inventory:low-stock-alert", data);
    io.to("role:MANAGER").emit("inventory:low-stock-alert", data);
  });

  socket.on("inventory:change", () => {
    io.emit("inventory:updated");
  });

  // ===== STAFF EVENTS =====
  socket.on("staff:clock-in", (data: any) => {
    io.to("role:ADMIN").emit("staff:clock-update", data);
    io.to("role:MANAGER").emit("staff:clock-update", data);
  });

  socket.on("staff:clock-out", (data: any) => {
    io.to("role:ADMIN").emit("staff:clock-update", data);
    io.to("role:MANAGER").emit("staff:clock-update", data);
  });

  // ===== NOTIFICATION EVENTS =====
  socket.on("notification:send", (data: { target: string; message: string; type: string }) => {
    io.to(`role:${data.target}`).emit("notification", data);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

console.log(`[Socket] WebSocket server running on port ${PORT}`);
