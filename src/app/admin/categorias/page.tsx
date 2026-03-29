"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import * as LucideIcons from "lucide-react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  product_count?: number;
}

// Lista curada de iconos útiles para repuestos y e-commerce
const CURATED_ICONS = [
  "Settings", "Wrench", "Disc", "Car", "CircleDot", "GitFork",
  "Battery", "Tool", "Zap", "Shield", "Key", "Truck",
  "Gauge", "Fuel", "Filter", "Activity", "Cpu", "Hammer",
  "PenTool", "Lightbulb", "Package", "ShoppingCart", "Tag", "Box",
  "Navigation", "WrenchIcon", "Cog", "Nut", "Thermometer", "Droplet"
];

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [formData, setFormData] = useState({ id: "", name: "", icon: "" });
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);

  // Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) {
      toast.error("Error al cargar categorías", { description: error.message });
      setLoading(false);
      return;
    }
    // Fetch product count per category
    const cats = data || [];
    const countsPromises = cats.map(async (cat: Category) => {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", cat.id);
      return { ...cat, product_count: count || 0 };
    });
    const catsWithCounts = await Promise.all(countsPromises);
    setCategories(catsWithCounts);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.icon) {
      toast.error("Faltan campos obligatorios.");
      return;
    }

    try {
      if (formData.id) {
        // Update
        const { error } = await supabase
          .from("categories")
          .update({ name: formData.name, icon: formData.icon })
          .eq("id", formData.id);
        if (error) throw error;
        toast.success("Categoría actualizada con éxito");
      } else {
        // Create
        const { error } = await supabase
          .from("categories")
          .insert([{ name: formData.name, icon: formData.icon }]);
        if (error) throw error;
        toast.success("Categoría creada con éxito");
      }
      setIsModalOpen(false);
      setFormData({ id: "", name: "", icon: "" });
      fetchCategories();
    } catch (err: any) {
      toast.error("Hubo un error al guardar", { description: err.message });
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    const { error } = await supabase.from("categories").delete().eq("id", categoryToDelete.id);
    if (error) {
      toast.error("No se pudo eliminar", { description: error.message });
    } else {
      toast.success("Categoría eliminada");
      fetchCategories();
    }
    setCategoryToDelete(null);
  };

  const openEditModal = (cat: Category) => {
    setFormData({ id: cat.id, name: cat.name, icon: cat.icon });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({ id: "", name: "", icon: "" });
    setIsModalOpen(true);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Vas a eliminar permanentemente &quot;<strong className="text-foreground">{categoryToDelete?.name}</strong>&quot; y <strong className="text-destructive font-bold">TODOS los repuestos</strong> que pertenecen a ella.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-48 hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filtrar categorías..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 bg-background h-9"
            />
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Nueva
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{formData.id ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Ej. Suspensión"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Selecciona un Ícono</Label>
                  <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto p-1">
                    {CURATED_ICONS.map((iconName) => {
                      const IconComp = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
                      const isSelected = formData.icon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          title={iconName}
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-md border transition-all hover:bg-muted",
                            isSelected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                          )}
                        >
                          <IconComp className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                  {!formData.icon && (
                    <p className="text-xs text-destructive">Por favor selecciona un ícono.</p>
                  )}
                </div>
                <Button type="submit" className="w-full mt-4">
                  Guardar Categoría
                </Button>
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
              <TableHead>Ícono</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Cargando categorías...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay categorías registradas.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>
                    {(() => {
                      const IconComp = (LucideIcons as any)[cat.icon] || LucideIcons.HelpCircle;
                      return (
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <IconComp className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{cat.icon}</span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold">
                      {cat.product_count ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setCategoryToDelete({id: cat.id, name: cat.name})}
                      title="Eliminar"
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
