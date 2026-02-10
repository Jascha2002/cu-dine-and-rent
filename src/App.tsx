import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Kantinen from "./pages/Kantinen";
import KantineDetail from "./pages/KantineDetail";
import Impressum from "./pages/Impressum";
import NotFound from "./pages/NotFound";

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
          <Route path="/vorbestellen" element={<Index />} />
          <Route path="/vermietung" element={<Index />} />
          <Route path="/catering" element={<Index />} />
          <Route path="/ueber-uns" element={<Index />} />
          <Route path="/kontakt" element={<Index />} />
          <Route path="/admin" element={<Index />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Index />} />
          <Route path="/agb-vorbestellung" element={<Index />} />
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
