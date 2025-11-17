import type { Metadata } from "next";
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/Tooltip';
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghost Writing Workflow",
  description: "Professional ghost writing workflow management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
          duration={4000}
        />
      </body>
    </html>
  );
}
