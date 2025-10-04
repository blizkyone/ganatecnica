"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function CustomBreadcrumbs({ currentPageName }) {
  const pathname = usePathname();

  // Parse the current path to determine the section and ID
  const pathSegments = pathname.split("/").filter(Boolean);
  const section = pathSegments[0]; // 'proyectos' or 'personal'
  const itemId = pathSegments[1]; // the ID if it exists

  // Define section names for display
  const sectionNames = {
    proyectos: "Proyectos",
    personal: "Personal",
  };

  // If we're on a home page (like /proyectos or /personal), don't show breadcrumbs
  if (!itemId) {
    return null;
  }

  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${section}`}>
                {sectionNames[section] || section}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{currentPageName || "Detalles"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
