import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Kantinen from "./pages/Kantinen";
import KantineDetail from "./pages/KantineDetail";
import Vorbestellen from "./pages/Vorbestellen";
import Vermietung from "./pages/Vermietung";
import Catering from "./pages/Catering";
import UeberUns from "./pages/UeberUns";
import Impressum from "./pages/Impressum";
import Kontakt from "./pages/Kontakt";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Jobs from "./pages/Jobs";
import AdminJobs from "./pages/AdminJobs";
import AdminMenuUpload from "./pages/AdminMenuUpload";
import AdminWeeklyMenus from "./pages/AdminWeeklyMenus";
import AGBCatering from "./pages/AGBCatering";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/kantinen" element={<Kantinen />} />
          <Route path="/kantinen/:id" element={<KantineDetail />} />
          <Route path="/vorbestellen" element={<Vorbestellen />} />
          <Route path="/vermietung" element={<Vermietung />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/ueber-uns" element={<UeberUns />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/menu-upload" element={<AdminMenuUpload />} />
          <Route path="/admin/weekly-menus" element={<AdminWeeklyMenus />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb-catering" element={<AGBCatering />} />
          <Route path="/agb-vermietung" element={<Index />} />
          <Route path="/widerruf" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
