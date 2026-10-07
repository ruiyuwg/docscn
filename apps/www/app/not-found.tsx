import { baseOptions } from "@/lib/layout.shared";
import { HomeLayout } from "@/registry/base/docs/layouts/home";
import { DefaultNotFound } from "@/registry/base/docs/layouts/home/not-found";

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <DefaultNotFound />
    </HomeLayout>
  );
}
