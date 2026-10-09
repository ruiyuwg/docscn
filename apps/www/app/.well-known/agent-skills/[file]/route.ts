import { notFound } from "next/navigation";
import { getSkills } from "@/lib/agent-skills";

export const revalidate = false;
export const dynamicParams = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/.well-known/agent-skills/[file]">,
) {
  const { file } = await params;
  const skill = (await getSkills()).find(
    (skill) => `${skill.name}.tar.gz` === file,
  );
  if (!skill) notFound();

  return new Response(new Uint8Array(skill.archive), {
    headers: {
      "Content-Type": "application/gzip",
    },
  });
}

export async function generateStaticParams() {
  return (await getSkills()).map((skill) => ({
    file: `${skill.name}.tar.gz`,
  }));
}
