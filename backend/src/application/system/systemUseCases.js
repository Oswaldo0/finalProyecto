import {
  checkDatabaseConnection,
  closeDatabasePool,
} from "../../infrastructure/database/mysql.js";

export function checkDatabaseConnectionUseCase() {
  return checkDatabaseConnection();
}

export function closeDatabasePoolUseCase() {
  return closeDatabasePool();
}
