-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "amount" REAL,
    "close_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "deals_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
