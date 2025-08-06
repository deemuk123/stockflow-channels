import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package, ShoppingCart, TrendingUp, Users, BarChart3, Plus } from "lucide-react";

const navigationItems = [
  { name: "Dashboard", path: "/", icon: BarChart3 },
  { name: "Stock Balance", path: "/stock", icon: Package },
  { name: "Products", path: "/products", icon: Package },
  { name: "Purchases", path: "/purchases", icon: ShoppingCart },
  { name: "Sales", path: "/sales", icon: TrendingUp },
  { name: "Vendors", path: "/vendors", icon: Users },
  { name: "Reports", path: "/reports", icon: BarChart3 },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("space-y-2", mobile && "px-4 py-6")}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Package className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">StockManager</span>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <NavContent />
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">StockManager</span>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <NavContent mobile />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}