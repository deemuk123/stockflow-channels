import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  minimum_stock: number;
  current_stock: number;
}

export default function StockBalance() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStockBalance();
  }, []);

  const loadStockBalance = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_balance")
        .select("*")
        .order("name");

      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      console.error("Error loading stock balance:", error);
      toast({
        title: "Error",
        description: "Failed to load stock balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (current <= minimum) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-1/4" />
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Balance</h1>
        <p className="text-muted-foreground">
          Current stock levels for all products
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Stock</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                stockItems.map((item) => {
                  const status = getStockStatus(item.current_stock, item.minimum_stock);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.current_stock <= item.minimum_stock && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                          {item.current_stock}
                        </div>
                      </TableCell>
                      <TableCell>{item.minimum_stock}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}