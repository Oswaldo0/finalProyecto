import {
  createGroup,
  getCatedraticosForForm,
  getCiclosForForm,
  getMateriasForForm,
  getAulasForForm,
  getGroupsWithStats,
  getGroupById,
} from "../../infrastructure/repositories/groupRepository.js";

export function getGroupFormOptions() {
  return Promise.all([
    getMateriasForForm(),
    getCatedraticosForForm(),
    getCiclosForForm(),
    getAulasForForm(),
  ]).then(([materias, catedraticos, ciclos, aulas]) => ({
    materias,
    catedraticos,
    ciclos,
    aulas,
  }));
}

export function createGroupUseCase(groupData) {
  return createGroup(groupData);
}

export function listGroups() {
  return getGroupsWithStats();
}

export function getGroupDetailsUseCase(groupId) {
  return getGroupById(groupId);
}
