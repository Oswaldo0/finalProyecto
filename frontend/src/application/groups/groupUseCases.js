import {
  createGroup,
  fetchGroupFormOptions,
  fetchGroupsList,
} from "../../infrastructure/api/groupApi.js";

export function getGroupFormOptions() {
  return fetchGroupFormOptions();
}

export function createGroupUseCase(groupData) {
  return createGroup(groupData);
}

export function listGroups() {
  return fetchGroupsList();
}
