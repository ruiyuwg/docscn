import { baseOptions } from "@/lib/layout.shared";
import { HomeLayout } from "@/registry/base/docs/layouts/home";

export default function Layout({ children }: LayoutProps<"/">) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
