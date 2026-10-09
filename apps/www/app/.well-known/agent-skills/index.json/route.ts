import {
  getSkillArchiveUrl,
  getSkills,
  skillsIndexSchema,
} from "@/lib/agent-skills";

export const revalidate = false;

export async function GET() {
  const skills = await getSkills();

  return Response.json({
    $schema: skillsIndexSchema,
    skills: skills.map((skill) => ({
      name: skill.name,
      type: "archive",
      description: skill.description,
      url: getSkillArchiveUrl(skill.name),
      digest: skill.digest,
    })),
  });
}
