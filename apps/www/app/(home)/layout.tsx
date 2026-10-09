import { baseOptions } from "@/lib/layout.shared";
import { HomeLayout } from "@/registry/base/docs/layouts/home";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        { text: "Docs", url: "/docs", active: "nested-url" },
        { text: "Components", url: "/docs#whats-included" },
        { text: "Compatibility", url: "/docs/compatibility" },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
