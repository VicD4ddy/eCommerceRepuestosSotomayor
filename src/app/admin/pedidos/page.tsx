"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  Search,
  MessageCircle,
  Eye,
  RefreshCw,
  Car,
  Phone,
  User,
  Truck,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface AdminOrder {
  id: string;
  order_code: string;
  customer_name: string;
  customer_id_doc: string;
  customer_phone: string;
  vehicle_info: string;
  delivery_method: string;
  delivery_agency: string | null;
  delivery_address: string | null;
  payment_method: string;
  total_usd: number;
  total_bs: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  order_items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price_usd: number;
  }>;
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
        setTableMissing(false);
      } else if (error) {
        console.warn("No se pudieron cargar pedidos (¿tabla creada en Supabase?):", error);
        if (error.code === "PGRST205" || error.message?.includes("orders")) {
          setTableMissing(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast.success(`Estado actualizado a ${newStatus}`);
    } catch (err: any) {
      toast.error("Error al actualizar estado: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Pendiente</span>;
      case "confirmado":
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Confirmado</span>;
      case "pagado":
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Pagado</span>;
      case "despachado":
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Despachado</span>;
      case "cancelado":
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Cancelado</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "todos" || o.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      o.order_code.toLowerCase().includes(term) ||
      o.customer_name.toLowerCase().includes(term) ||
      o.customer_phone.includes(term) ||
      o.vehicle_info.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  // Métricas rápidas
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pendiente").length;
  const totalSalesUsd = orders
    .filter((o) => o.status === "pagado" || o.status === "despachado")
    .reduce((acc, curr) => acc + Number(curr.total_usd), 0);

  const openWhatsAppToCustomer = (phone: string, orderCode: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const finalPhone = cleanPhone.startsWith("58") ? cleanPhone : `58${cleanPhone.replace(/^0/, "")}`;
    const msg = `¡Hola ${name}! Te escribimos de *Repuestos Sotomayor* con relación a tu pedido *#${orderCode}* 🚗📦`;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="text-primary h-7 w-7" />
            Gestión de Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitorea las cotizaciones y compras concretadas en tiempo real.
          </p>
        </div>

        <Button
          onClick={fetchOrders}
          variant="outline"
          size="sm"
          className="gap-2 text-xs font-bold self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </Button>
      </div>

      {tableMissing && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-amber-950 flex items-start gap-3 shadow-sm">
          <AlertCircle className="text-amber-600 h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-amber-950 text-sm">
              Falta crear las tablas de Pedidos en tu base de datos Supabase
            </p>
            <p className="mt-1 text-slate-700">
              Para que los pedidos se guarden y aparezcan en esta pantalla, copia y ejecuta el script <strong><code>supabase_orders.sql</code></strong> en el <strong>SQL Editor de Supabase</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Pedidos</span>
          <span className="text-2xl font-display font-black text-slate-900 mt-1 block">{totalOrders}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Por Confirmar</span>
          <span className="text-2xl font-display font-black text-amber-800 mt-1 block">{pendingOrders}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Ventas Concretadas</span>
          <span className="text-2xl font-display font-black text-emerald-800 mt-1 block">
            ${totalSalesUsd.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por #, cliente, carro o tlf..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Estado:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-xs h-9 w-[150px]">
              <SelectValue placeholder="Filtrar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="despachado">Despachado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-xs font-bold text-slate-600">Código</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Cliente / Teléfono</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Vehículo</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Entrega</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Monto USD</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Estado</TableHead>
              <TableHead className="text-xs font-bold text-slate-600 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500">
                  Cargando pedidos...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500">
                  No se encontraron pedidos.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-mono font-bold text-xs text-primary">
                    #{order.order_code}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-xs text-slate-800">{order.customer_name}</p>
                    <p className="text-[11px] text-slate-500">{order.customer_phone}</p>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 max-w-[180px] truncate">
                    {order.vehicle_info}
                  </TableCell>
                  <TableCell className="text-xs capitalize text-slate-600">
                    {order.delivery_method === "tienda"
                      ? "Tienda"
                      : `${order.delivery_method} (${order.delivery_agency || ""})`}
                  </TableCell>
                  <TableCell className="font-display font-black text-xs text-slate-900">
                    ${Number(order.total_usd).toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right space-x-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDialogOpen(true);
                      }}
                      className="h-8 w-8 p-0"
                      title="Ver Detalle"
                    >
                      <Eye size={15} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openWhatsAppToCustomer(
                          order.customer_phone,
                          order.order_code,
                          order.customer_name
                        )
                      }
                      className="h-8 w-8 p-0 text-[#25D366] hover:text-[#1ebe5a] border-slate-200"
                      title="Escribir por WhatsApp"
                    >
                      <MessageCircle size={15} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Detalle de Orden */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-display font-black">
                    Detalle de Orden #{selectedOrder.order_code}
                  </DialogTitle>
                  <div className="mr-6">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <DialogDescription className="text-xs text-slate-500">
                  Creado el {new Date(selectedOrder.created_at).toLocaleString("es-VE")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* Cambiar Estado */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                  <span className="font-bold text-slate-700">Cambiar estado del pedido:</span>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(val) => handleUpdateStatus(selectedOrder.id, val)}
                    disabled={updatingId === selectedOrder.id}
                  >
                    <SelectTrigger className="h-8 w-40 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="despachado">Despachado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Info Cliente y Vehículo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                    <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Cliente</p>
                    <p className="font-medium text-slate-900">{selectedOrder.customer_name}</p>
                    <p className="text-slate-500">Doc: {selectedOrder.customer_id_doc}</p>
                    <p className="text-slate-500">Tlf: {selectedOrder.customer_phone}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                    <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Vehículo</p>
                    <p className="font-medium text-slate-900">{selectedOrder.vehicle_info}</p>
                    <p className="text-slate-500">
                      Entrega: <span className="capitalize">{selectedOrder.delivery_method}</span>
                    </p>
                    {selectedOrder.delivery_address && (
                      <p className="text-slate-500 text-[11px] truncate">
                        Destino: {selectedOrder.delivery_address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Repuestos */}
                <div>
                  <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px] mb-2">
                    Repuestos Pedidos
                  </p>
                  <div className="border rounded-xl divide-y">
                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                      selectedOrder.order_items.map((it) => (
                        <div key={it.id} className="p-2.5 flex justify-between items-center text-xs">
                          <span>
                            <strong>{it.quantity}x</strong> {it.product_name}
                          </span>
                          <span className="font-bold font-display">
                            ${(it.price_usd * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-slate-400 text-center">Sin desglose registrado en base de datos.</p>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-xl">
                  <span className="font-bold text-xs uppercase text-slate-300">Total</span>
                  <div className="text-right">
                    <span className="text-lg font-black font-display block">
                      ${Number(selectedOrder.total_usd).toFixed(2)} USD
                    </span>
                    {selectedOrder.total_bs && (
                      <span className="text-xs text-primary font-bold">
                        Bs. {Number(selectedOrder.total_bs).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botones de acción modal */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() =>
                      openWhatsAppToCustomer(
                        selectedOrder.customer_phone,
                        selectedOrder.order_code,
                        selectedOrder.customer_name
                      )
                    }
                    className="w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold h-9 text-xs gap-2"
                  >
                    <MessageCircle size={15} /> Escribir al Cliente por WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/pedido/${selectedOrder.id}`, "_blank")}
                    className="h-9 px-3 text-xs gap-1"
                    title="Ver recibo público"
                  >
                    <ExternalLink size={14} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
