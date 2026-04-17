import { createUser, fetchUserFormOptions, fetchUsers } from "../../infrastructure/api/userApi.js";

export function getUserFormOptions() {
  return fetchUserFormOptions();
}

export function createUserUseCase(payload) {
  return createUser(payload);
}

export function listUsers(limit = 25) {
  return fetchUsers(limit);
}
