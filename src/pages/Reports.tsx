import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ShoppingCart, Receipt, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportStats {
  totalProducts: number;
  totalPurchaseOrders: number;
  totalSalesOrders: number;
  lowStockItems: number;
  totalPurchaseValue: number;
  totalSalesValue: number;
}

const Reports = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalProducts: 0,
    totalPurchaseOrders: 0,
    totalSalesOrders: 0,
    lowStockItems: 0,
    totalPurchaseValue: 0,
    totalSalesValue: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadReportData = async () => {
    try {
      // Load all data in parallel
      const [
        productsResult,
        purchaseOrdersResult,
        salesOrdersResult,
        stockBalanceResult
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("purchase_orders").select("total_amount"),
        supabase.from("sales_orders").select("total_amount"),
        supabase.from("stock_balance").select("*")
      ]);

      if (productsResult.error) throw productsResult.error;
      if (purchaseOrdersResult.error) throw purchaseOrdersResult.error;
      if (salesOrdersResult.error) throw salesOrdersResult.error;
      if (stockBalanceResult.error) throw stockBalanceResult.error;

      const totalPurchaseValue = purchaseOrdersResult.data?.reduce(
        (sum, order) => sum + (order.total_amount || 0), 0
      ) || 0;

      const totalSalesValue = salesOrdersResult.data?.reduce(
        (sum, order) => sum + (order.total_amount || 0), 0
      ) || 0;

      const lowStockItems = stockBalanceResult.data?.filter(
        item => (item.current_stock || 0) <= (item.minimum_stock || 0)
      ).length || 0;

      setStats({
        totalProducts: productsResult.count || 0,
        totalPurchaseOrders: purchaseOrdersResult.data?.length || 0,
        totalSalesOrders: salesOrdersResult.data?.length || 0,
        lowStockItems,
        totalPurchaseValue,
        totalSalesValue
      });
    } catch (error) {
      console.error("Error loading report data:", error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Overview of your business performance and key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchaseOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total purchase orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Orders</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSalesOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total sales orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items below minimum stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalPurchaseValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total purchase value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalSalesValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total sales revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>
            Key performance indicators for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Stock Alert</p>
              <p className="text-sm text-muted-foreground">
                {stats.lowStockItems > 0 
                  ? `${stats.lowStockItems} items need restocking` 
                  : "All items are adequately stocked"
                }
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${stats.lowStockItems > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Revenue vs Expenses</p>
              <p className="text-sm text-muted-foreground">
                Net: ${(stats.totalSalesValue - stats.totalPurchaseValue).toFixed(2)}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              stats.totalSalesValue > stats.totalPurchaseValue ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;