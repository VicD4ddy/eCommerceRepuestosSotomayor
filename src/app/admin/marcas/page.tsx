"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
}

export default function BrandsAdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "" });

  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      toast.error("Error al cargar marcas", { description: error.message });
    } else {
      setBrands(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("El nombre de la marca es obligatorio.");
      return;
    }

    try {
      if (formData.id) {
        const { error } = await supabase
          .from("brands")
          .update({ name: formData.name })
          .eq("id", formData.id);
        if (error) throw error;
        toast.success("Marca modificada con éxito");
      } else {
        const { error } = await supabase
          .from("brands")
          .insert([{ name: formData.name }]);
        if (error) throw error;
        toast.success("Marca creada con éxito");
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      toast.error("Error al guardar", { description: err.message });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la marca "${name}"? Esto podría fallar si hay productos usándola.`)) return;

    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar", { description: "Verifica que no existan productos enlazados a esta marca." });
    } else {
      toast.success("Marca eliminada");
      fetchBrands();
    }
  };

  const openCreateModal = () => {
    setFormData({ id: "", name: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setFormData({ id: brand.id, name: brand.name });
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Marcas</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Nueva
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{formData.id ? "Editar Marca" : "Nueva Marca"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre de la Marca</Label>
                  <Input
                    placeholder="Ej. Bosch, Toyota..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Guardar Marca</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">Cargando marcas...</TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">No hay marcas registradas.</TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-bold uppercase tracking-wide">{brand.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(brand)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(brand.id, brand.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
