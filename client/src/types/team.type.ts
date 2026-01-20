import { ProjectRole } from "./project.type";

export interface TeamMemberUI {
  userId: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  // Bu kişiyle hangi projelerde çalışıyoruz?
  associatedProjects: {
    projectId: string;
    projectName: string;
    projectRole: ProjectRole;
  }[];
}
