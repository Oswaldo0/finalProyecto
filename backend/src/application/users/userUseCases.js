import { normalizeUserPayload } from "../../domain/user/userModel.js";
import {
  createUser,
  getUserFormOptions,
  getUsersWithSchema,
} from "../../infrastructure/repositories/userRepository.js";

export function listUsers(limit) {
  return getUsersWithSchema(limit);
}

export function getUserOptions() {
  return getUserFormOptions();
}

export function createUserUseCase(payload) {
  return createUser(normalizeUserPayload(payload));
}
