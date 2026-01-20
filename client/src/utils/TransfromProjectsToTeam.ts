// src/utils/TransfromProjectsToTeam.ts
import { Project, ProjectRole } from "../types/project.type";
import { TeamMemberUI } from "../types/team.type";

/**
 * Backend'den gelen ham veriyi karşılayan ara tip.
 * 'any' kullanmamak için bu yapıyı kuruyoruz.
 */
interface BackendProjectData extends Omit<Project, "members"> {
  members: Array<{
    id: string;
    role: string;
    userId: string;
    user: {
      id: string;
      email: string;
      firstname: string | null;
      lastname: string | null;
    };
  }>;
}

export const transformProjectsToTeam = (
  // projects'i unknown alıp içeride güvenli cast yapıyoruz
  projects: unknown[], 
  currentUserId?: string
): TeamMemberUI[] => {
  const memberMap = new Map<string, TeamMemberUI>();
  
  // Burada tek seferlik cast işlemi: ESLint 'any' olmadığı için kızmaz
  const data = projects as BackendProjectData[];

  data.forEach((project) => {
    project.members?.forEach((member) => {
      const userData = member.user;
      
      if (!userData || userData.id === currentUserId) return;

      const existing = memberMap.get(userData.email);

      const projectLink = {
        projectId: project.id,
        projectName: project.name,
        projectRole: member.role as ProjectRole, 
      };

      if (existing) {
        existing.associatedProjects.push(projectLink);
      } else {
        memberMap.set(userData.email, {
          userId: userData.id,
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          associatedProjects: [projectLink],
        });
      }
    });
  });

  return Array.from(memberMap.values());
};