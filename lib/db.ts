import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import fs from "node:fs/promises";
import path from "node:path";
import type {
  DashboardResponse,
  Goal,
  OverviewResponse,
  StorageMode,
  Transaction,
  TransactionDirection,
  TransactionStatus,
  WalletSummary,
} from "./types";

interface LocalDbSchema {
  wallet: WalletSummary;
  transactions: Transaction[];
  goals: Goal[];
  nextTransactionId: number;
  nextGoalId: number;
}

const LOCAL_DB_DIR = path.join(process.cwd(), ".data");
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, "nova-db.json");

let _sql: NeonQueryFunction<false, false> | null = null;
let _schemaPromise: Promise<void> | null = null;
let _localWriteQueue: Promise<unknown> = Promise.resolve();

export function getStorageMode(): StorageMode {
  return process.env.DATABASE_URL ? "neon" : "local";
}

function getNeonSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!_sql) {
    _sql = neon(url);
  }
  return _sql;
}

function buildSeedData(): LocalDbSchema {
  const now = new Date();
  const hoursAgo = (h: number) =>
    new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
  const daysAgo = (d: number, hour = 13) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    dt.setHours(hour, 15, 0, 0);
    return dt.toISOString();
  };

  const transactions: Transaction[] = [
    {
      id: 1,
      title: "Spotify Duo",
      counterparty: "Spotify",
      counterpartyPhone: null,
      category: "Subscription",
      direction: "debit",
      status: "Completed",
      amountPaisa: 12000,
      provider: "khalti",
      khaltiPidx: "KLT-2026-8812",
      khaltiTransactionId: "TXN-881201",
      purchaseOrderId: "NOVA-SEED-001",
      paymentUrl: null,
      note: "Monthly audio plan",
      createdAt: hoursAgo(2),
    },
    {
      id: 2,
      title: "Pathao Ride",
      counterparty: "Pathao Nepal",
      counterpartyPhone: "9801122334",
      category: "Transport",
      direction: "debit",
      status: "Completed",
      amountPaisa: 25000,
      provider: "khalti",
      khaltiPidx: "KLT-2026-8809",
      khaltiTransactionId: "TXN-880944",
      purchaseOrderId: "NOVA-SEED-002",
      paymentUrl: null,
      note: "Patan to Thamel",
      createdAt: hoursAgo(5),
    },
    {
      id: 3,
      title: "Aayush Shrestha",
      counterparty: "Aayush Shrestha",
      counterpartyPhone: "9841002211",
      category: "Split Bill",
      direction: "request",
      status: "Requested",
      amountPaisa: 120000,
      provider: "khalti",
      khaltiPidx: "khalti_req_seed_003",
      khaltiTransactionId: null,
      purchaseOrderId: "NOVA-REQ-003",
      paymentUrl: "/khalti/checkout?pidx=khalti_req_seed_003",
      note: "Dinner split at Jhamsikhel",
      createdAt: hoursAgo(9),
    },
    {
      id: 4,
      title: "WorldLink Fiber",
      counterparty: "WorldLink Communications",
      counterpartyPhone: null,
      category: "Bills",
      direction: "debit",
      status: "Completed",
      amountPaisa: 145000,
      provider: "khalti",
      khaltiPidx: "KLT-2026-8791",
      khaltiTransactionId: "TXN-879110",
      purchaseOrderId: "NOVA-SEED-004",
      paymentUrl: null,
      note: "200 Mbps monthly renewal",
      createdAt: daysAgo(1, 14),
    },
    {
      id: 5,
      title: "Freelance Retainer",
      counterparty: "Himalayan Studio",
      counterpartyPhone: "9851099887",
      category: "Income",
      direction: "credit",
      status: "Completed",
      amountPaisa: 2450000,
      provider: "khalti",
      khaltiPidx: "KLT-2026-8774",
      khaltiTransactionId: "TXN-877402",
      purchaseOrderId: "NOVA-SEED-005",
      paymentUrl: null,
      note: "UI sprint milestone",
      createdAt: daysAgo(2, 11),
    },
    {
      id: 6,
      title: "Bhat-Bhateni Groceries",
      counterparty: "Bhat-Bhateni",
      counterpartyPhone: null,
      category: "Food",
      direction: "debit",
      status: "Completed",
      amountPaisa: 284050,
      provider: "khalti",
      khaltiPidx: "KLT-2026-8752",
      khaltiTransactionId: "TXN-875290",
      purchaseOrderId: "NOVA-SEED-006",
      paymentUrl: null,
      note: "Weekly pantry & coffee",
      createdAt: daysAgo(3, 18),
    },
    {
      id: 7,
      title: "Daraz Order",
      counterparty: "Daraz Nepal",
      counterpartyPhone: null,
      category: "Shopping",
      direction: "debit",
      status: "Completed",
      amountPaisa: 168547,
      provider: "khalti",
      khaltiPidx: "KLT-2026-8730",
      khaltiTransactionId: "TXN-873018",
      purchaseOrderId: "NOVA-SEED-007",
      paymentUrl: null,
      note: "USB-C hub & notebook",
      createdAt: daysAgo(4, 16),
    },
    {
      id: 8,
      title: "YouTube Premium",
      counterparty: "YouTube",
      counterpartyPhone: null,
      category: "Subscription",
      direction: "debit",
      status: "Completed",
      amountPaisa: 39900,
      provider: "khalti",
      khaltiPidx: "KLT-2026-8704",
      khaltiTransactionId: "TXN-870455",
      purchaseOrderId: "NOVA-SEED-008",
      paymentUrl: null,
      note: "Family plan",
      createdAt: daysAgo(5, 10),
    },
    {
      id: 9,
      title: "NEA Electricity",
      counterparty: "Nepal Electricity Authority",
      counterpartyPhone: null,
      category: "Bills",
      direction: "debit",
      status: "Completed",
      amountPaisa: 128203,
      provider: "khalti",
      khaltiPidx: "KLT-2026-8680",
      khaltiTransactionId: "TXN-868011",
      purchaseOrderId: "NOVA-SEED-009",
      paymentUrl: null,
      note: "Meter #44019-KTM",
      createdAt: daysAgo(6, 9),
    },
  ];

  const goals: Goal[] = [
    {
      id: 1,
      name: "New Laptop",
      targetPaisa: 10000000,
      savedPaisa: 3500000,
      targetDate: "2027-03-01",
      createdAt: daysAgo(20, 10),
    },
    {
      id: 2,
      name: "Emergency Fund",
      targetPaisa: 5000000,
      savedPaisa: 1800000,
      targetDate: "2027-01-01",
      createdAt: daysAgo(15, 10),
    },
    {
      id: 3,
      name: "Pokhara Retreat",
      targetPaisa: 8000000,
      savedPaisa: 1200000,
      targetDate: "2027-06-01",
      createdAt: daysAgo(10, 10),
    },
  ];

  return {
    wallet: {
      id: 1,
      ownerName: "Kaladevi",
      khaltiId: "9800000000",
      balancePaisa: 1733903,
      savingPaisa: 325103,
      billsPaisa: 325103,
      currency: "NPR",
      updatedAt: now.toISOString(),
    },
    transactions,
    goals,
    nextTransactionId: 10,
    nextGoalId: 4,
  };
}

async function readLocalDb(): Promise<LocalDbSchema> {
  try {
    const raw = await fs.readFile(LOCAL_DB_FILE, "utf8");
    return JSON.parse(raw) as LocalDbSchema;
  } catch {
    const seeded = buildSeedData();
    await fs.mkdir(LOCAL_DB_DIR, { recursive: true });
    await fs.writeFile(LOCAL_DB_FILE, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  }
}

async function writeLocalDb(data: LocalDbSchema): Promise<void> {
  await fs.mkdir(LOCAL_DB_DIR, { recursive: true });
  await fs.writeFile(LOCAL_DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

function withLocalLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = _localWriteQueue.then(fn, fn);
  _localWriteQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function ensureNeonSchema(): Promise<void> {
  if (_schemaPromise) return _schemaPromise;

  _schemaPromise = (async () => {
    const sql = getNeonSql();

    await sql`
      CREATE TABLE IF NOT EXISTS wallet_accounts (
        id SERIAL PRIMARY KEY,
        owner_name TEXT NOT NULL,
        khalti_id TEXT NOT NULL,
        balance_paisa BIGINT NOT NULL DEFAULT 0,
        saving_paisa BIGINT NOT NULL DEFAULT 0,
        bills_paisa BIGINT NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'NPR',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        counterparty TEXT NOT NULL,
        counterparty_phone TEXT,
        category TEXT NOT NULL,
        direction TEXT NOT NULL,
        status TEXT NOT NULL,
        amount_paisa BIGINT NOT NULL,
        provider TEXT NOT NULL DEFAULT 'khalti',
        khalti_pidx TEXT UNIQUE,
        khalti_transaction_id TEXT,
        purchase_order_id TEXT,
        payment_url TEXT,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        target_paisa BIGINT NOT NULL,
        saved_paisa BIGINT NOT NULL DEFAULT 0,
        target_date TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id BIGSERIAL PRIMARY KEY,
        role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    const existingWallets = await sql`SELECT id FROM wallet_accounts LIMIT 1`;
    if (existingWallets.length === 0) {
      const seed = buildSeedData();
      await sql`
        INSERT INTO wallet_accounts (owner_name, khalti_id, balance_paisa, saving_paisa, bills_paisa, currency)
        VALUES (${seed.wallet.ownerName}, ${seed.wallet.khaltiId}, ${seed.wallet.balancePaisa}, ${seed.wallet.savingPaisa}, ${seed.wallet.billsPaisa}, ${seed.wallet.currency})
      `;

      for (const tx of seed.transactions) {
        await sql`
          INSERT INTO transactions (
            title, counterparty, counterparty_phone, category, direction, status,
            amount_paisa, provider, khalti_pidx, khalti_transaction_id, purchase_order_id,
            payment_url, note, created_at
          ) VALUES (
            ${tx.title}, ${tx.counterparty}, ${tx.counterpartyPhone}, ${tx.category}, ${tx.direction}, ${tx.status},
            ${tx.amountPaisa}, ${tx.provider}, ${tx.khaltiPidx}, ${tx.khaltiTransactionId}, ${tx.purchaseOrderId},
            ${tx.paymentUrl}, ${tx.note}, ${tx.createdAt}
          )
          ON CONFLICT (khalti_pidx) DO NOTHING
        `;
      }

      for (const goal of seed.goals) {
        await sql`
          INSERT INTO savings_goals (name, target_paisa, saved_paisa, target_date, created_at)
          VALUES (${goal.name}, ${goal.targetPaisa}, ${goal.savedPaisa}, ${goal.targetDate}, ${goal.createdAt})
        `;
      }
    }
  })();

  try {
    await _schemaPromise;
  } catch (err) {
    _schemaPromise = null;
    throw err;
  }
}

function mapWalletRow(row: Record<string, unknown>): WalletSummary {
  return {
    id: Number(row.id),
    ownerName: String(row.owner_name),
    khaltiId: String(row.khalti_id),
    balancePaisa: Number(row.balance_paisa),
    savingPaisa: Number(row.saving_paisa),
    billsPaisa: Number(row.bills_paisa),
    currency: String(row.currency ?? "NPR"),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapTransactionRow(row: Record<string, unknown>): Transaction {
  return {
    id: Number(row.id),
    title: String(row.title),
    counterparty: String(row.counterparty),
    counterpartyPhone: row.counterparty_phone
      ? String(row.counterparty_phone)
      : null,
    category: String(row.category),
    direction: row.direction as TransactionDirection,
    status: row.status as TransactionStatus,
    amountPaisa: Number(row.amount_paisa),
    provider: (row.provider as "khalti" | "nova") ?? "khalti",
    khaltiPidx: row.khalti_pidx ? String(row.khalti_pidx) : null,
    khaltiTransactionId: row.khalti_transaction_id
      ? String(row.khalti_transaction_id)
      : null,
    purchaseOrderId: row.purchase_order_id
      ? String(row.purchase_order_id)
      : null,
    paymentUrl: row.payment_url ? String(row.payment_url) : null,
    note: row.note ? String(row.note) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapGoalRow(row: Record<string, unknown>): Goal {
  return {
    id: Number(row.id),
    name: String(row.name),
    targetPaisa: Number(row.target_paisa),
    savedPaisa: Number(row.saved_paisa),
    targetDate: String(row.target_date),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function computeDashboardStats(
  transactions: Transaction[],
  goals: Goal[]
): DashboardResponse["stats"] {
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();

  let monthIncomePaisa = 0;
  let monthSpendPaisa = 0;
  let monthBillsPaisa = 0;
  let pendingRequestsCount = 0;
  let pendingRequestsPaisa = 0;

  for (const tx of transactions) {
    const dt = new Date(tx.createdAt);
    const sameMonth =
      dt.getMonth() === curMonth && dt.getFullYear() === curYear;

    if (tx.direction === "request" && (tx.status === "Requested" || tx.status === "Pending")) {
      pendingRequestsCount += 1;
      pendingRequestsPaisa += tx.amountPaisa;
    }

    if (sameMonth && tx.status === "Completed") {
      if (tx.direction === "credit") {
        monthIncomePaisa += tx.amountPaisa;
      } else if (tx.direction === "debit") {
        monthSpendPaisa += tx.amountPaisa;
        if (tx.category === "Bills" || tx.category === "Subscription") {
          monthBillsPaisa += tx.amountPaisa;
        }
      }
    }
  }

  const goalsSavedPaisa = goals.reduce((acc, g) => acc + g.savedPaisa, 0);
  const goalsTargetPaisa = goals.reduce((acc, g) => acc + g.targetPaisa, 0);

  return {
    monthIncomePaisa,
    monthSpendPaisa,
    monthBillsPaisa,
    pendingRequestsCount,
    pendingRequestsPaisa,
    goalsSavedPaisa,
    goalsTargetPaisa,
  };
}

export async function getDashboardData(filters?: {
  q?: string;
  direction?: string;
}): Promise<DashboardResponse> {
  const mode = getStorageMode();
  const khaltiMode = process.env.KHALTI_SECRET_KEY ? "live" : "sandbox";
  const q = filters?.q?.trim().toLowerCase() ?? "";
  const dir = filters?.direction?.trim() ?? "";

  let wallet: WalletSummary;
  let allTransactions: Transaction[];
  let goals: Goal[];

  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    const [walletRows, txRows, goalRows] = await Promise.all([
      sql`SELECT * FROM wallet_accounts ORDER BY id ASC LIMIT 1`,
      sql`SELECT * FROM transactions ORDER BY created_at DESC, id DESC`,
      sql`SELECT * FROM savings_goals ORDER BY id ASC`,
    ]);
    wallet = mapWalletRow(walletRows[0]);
    allTransactions = txRows.map(mapTransactionRow);
    goals = goalRows.map(mapGoalRow);
  } else {
    const db = await readLocalDb();
    wallet = db.wallet;
    allTransactions = [...db.transactions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
        b.id - a.id
    );
    goals = db.goals;
  }

  const stats = computeDashboardStats(allTransactions, goals);

  const filteredTransactions = allTransactions.filter((tx) => {
    if (dir && dir !== "all" && tx.direction !== dir) return false;
    if (!q) return true;
    const haystack = [
      tx.title,
      tx.counterparty,
      tx.category,
      tx.khaltiPidx ?? "",
      tx.note ?? "",
      tx.status,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return {
    storageMode: mode,
    khaltiMode,
    wallet,
    transactions: filteredTransactions,
    goals,
    stats,
  };
}

export async function createPendingKhaltiTransaction(input: {
  title: string;
  counterparty: string;
  counterpartyPhone?: string | null;
  category: string;
  direction: TransactionDirection;
  status: TransactionStatus;
  amountPaisa: number;
  khaltiPidx: string;
  purchaseOrderId: string;
  paymentUrl: string | null;
  note?: string | null;
}): Promise<Transaction> {
  const mode = getStorageMode();

  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    const rows = await sql`
      INSERT INTO transactions (
        title, counterparty, counterparty_phone, category, direction, status,
        amount_paisa, provider, khalti_pidx, purchase_order_id, payment_url, note
      ) VALUES (
        ${input.title}, ${input.counterparty}, ${input.counterpartyPhone ?? null},
        ${input.category}, ${input.direction}, ${input.status},
        ${input.amountPaisa}, 'khalti', ${input.khaltiPidx},
        ${input.purchaseOrderId}, ${input.paymentUrl}, ${input.note ?? null}
      )
      RETURNING *
    `;
    return mapTransactionRow(rows[0]);
  }

  return withLocalLock(async () => {
    const db = await readLocalDb();
    const tx: Transaction = {
      id: db.nextTransactionId++,
      title: input.title,
      counterparty: input.counterparty,
      counterpartyPhone: input.counterpartyPhone ?? null,
      category: input.category,
      direction: input.direction,
      status: input.status,
      amountPaisa: input.amountPaisa,
      provider: "khalti",
      khaltiPidx: input.khaltiPidx,
      khaltiTransactionId: null,
      purchaseOrderId: input.purchaseOrderId,
      paymentUrl: input.paymentUrl,
      note: input.note ?? null,
      createdAt: new Date().toISOString(),
    };
    db.transactions.unshift(tx);
    await writeLocalDb(db);
    return tx;
  });
}

export async function getTransactionByPidx(
  pidx: string
): Promise<Transaction | null> {
  const mode = getStorageMode();
  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    const rows = await sql`
      SELECT * FROM transactions WHERE khalti_pidx = ${pidx} LIMIT 1
    `;
    return rows.length > 0 ? mapTransactionRow(rows[0]) : null;
  }

  const db = await readLocalDb();
  return db.transactions.find((t) => t.khaltiPidx === pidx) ?? null;
}

export async function settleKhaltiTransaction(input: {
  pidx: string;
  status: TransactionStatus;
  khaltiTransactionId?: string | null;
}): Promise<{ transaction: Transaction | null; wallet: WalletSummary; alreadySettled: boolean }> {
  const mode = getStorageMode();

  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    const existingRows = await sql`
      SELECT * FROM transactions WHERE khalti_pidx = ${input.pidx} LIMIT 1
    `;
    if (existingRows.length === 0) {
      const wRows = await sql`SELECT * FROM wallet_accounts ORDER BY id ASC LIMIT 1`;
      return {
        transaction: null,
        wallet: mapWalletRow(wRows[0]),
        alreadySettled: false,
      };
    }

    const existing = mapTransactionRow(existingRows[0]);
    if (existing.status === "Completed") {
      const wRows = await sql`SELECT * FROM wallet_accounts ORDER BY id ASC LIMIT 1`;
      return {
        transaction: existing,
        wallet: mapWalletRow(wRows[0]),
        alreadySettled: true,
      };
    }

    const nextDirection: TransactionDirection =
      existing.direction === "request" && input.status === "Completed"
        ? "credit"
        : existing.direction;

    const updatedRows = await sql`
      UPDATE transactions
      SET status = ${input.status},
          direction = ${nextDirection},
          khalti_transaction_id = COALESCE(${input.khaltiTransactionId ?? null}, khalti_transaction_id)
      WHERE khalti_pidx = ${input.pidx}
      RETURNING *
    `;

    if (input.status === "Completed") {
      const delta =
        nextDirection === "credit"
          ? existing.amountPaisa
          : -existing.amountPaisa;
      const billsDelta =
        nextDirection === "debit" &&
        (existing.category === "Bills" || existing.category === "Subscription")
          ? existing.amountPaisa
          : 0;
      await sql`
        UPDATE wallet_accounts
        SET balance_paisa = GREATEST(balance_paisa + ${delta}, 0),
            bills_paisa = bills_paisa + ${billsDelta},
            updated_at = NOW()
        WHERE id = (SELECT id FROM wallet_accounts ORDER BY id ASC LIMIT 1)
      `;
    }

    const wRows = await sql`SELECT * FROM wallet_accounts ORDER BY id ASC LIMIT 1`;
    return {
      transaction: mapTransactionRow(updatedRows[0]),
      wallet: mapWalletRow(wRows[0]),
      alreadySettled: false,
    };
  }

  return withLocalLock(async () => {
    const db = await readLocalDb();
    const idx = db.transactions.findIndex((t) => t.khaltiPidx === input.pidx);
    if (idx === -1) {
      return { transaction: null, wallet: db.wallet, alreadySettled: false };
    }

    const existing = db.transactions[idx];
    if (existing.status === "Completed") {
      return {
        transaction: existing,
        wallet: db.wallet,
        alreadySettled: true,
      };
    }

    const nextDirection: TransactionDirection =
      existing.direction === "request" && input.status === "Completed"
        ? "credit"
        : existing.direction;

    const updated: Transaction = {
      ...existing,
      status: input.status,
      direction: nextDirection,
      khaltiTransactionId:
        input.khaltiTransactionId ?? existing.khaltiTransactionId,
    };
    db.transactions[idx] = updated;

    if (input.status === "Completed") {
      if (nextDirection === "credit") {
        db.wallet.balancePaisa += existing.amountPaisa;
      } else {
        db.wallet.balancePaisa = Math.max(
          db.wallet.balancePaisa - existing.amountPaisa,
          0
        );
        if (
          existing.category === "Bills" ||
          existing.category === "Subscription"
        ) {
          db.wallet.billsPaisa += existing.amountPaisa;
        }
      }
      db.wallet.updatedAt = new Date().toISOString();
    }

    await writeLocalDb(db);
    return {
      transaction: updated,
      wallet: db.wallet,
      alreadySettled: false,
    };
  });
}

export async function listGoals(): Promise<{
  storageMode: StorageMode;
  goals: Goal[];
}> {
  const mode = getStorageMode();
  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    const rows = await sql`SELECT * FROM savings_goals ORDER BY id ASC`;
    return { storageMode: mode, goals: rows.map(mapGoalRow) };
  }

  const db = await readLocalDb();
  return { storageMode: mode, goals: db.goals };
}

export async function createGoalRecord(input: {
  name: string;
  targetPaisa: number;
  savedPaisa: number;
  targetDate: string;
}): Promise<Goal> {
  const mode = getStorageMode();
  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    const rows = await sql`
      INSERT INTO savings_goals (name, target_paisa, saved_paisa, target_date)
      VALUES (${input.name}, ${input.targetPaisa}, ${input.savedPaisa}, ${input.targetDate})
      RETURNING *
    `;
    return mapGoalRow(rows[0]);
  }

  return withLocalLock(async () => {
    const db = await readLocalDb();
    const goal: Goal = {
      id: db.nextGoalId++,
      name: input.name,
      targetPaisa: input.targetPaisa,
      savedPaisa: input.savedPaisa,
      targetDate: input.targetDate,
      createdAt: new Date().toISOString(),
    };
    db.goals.push(goal);
    db.wallet.savingPaisa = db.goals.reduce((s, g) => s + g.savedPaisa, 0);
    db.wallet.updatedAt = new Date().toISOString();
    await writeLocalDb(db);
    return goal;
  });
}

export async function contributeGoalRecord(input: {
  id: number;
  amountPaisa: number;
}): Promise<Goal | null> {
  const mode = getStorageMode();
  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();

    // Check wallet balance first
    const walletRows = await sql`
      SELECT balance_paisa FROM wallet_accounts ORDER BY id ASC LIMIT 1
    `;
    if (walletRows.length === 0) throw new Error("Wallet not found.");
    const balancePaisa = Number(walletRows[0].balance_paisa);
    if (balancePaisa < input.amountPaisa) {
      throw new Error("Insufficient balance");
    }

    // Deduct from wallet and add to goal atomically
    const rows = await sql`
      WITH wallet_update AS (
        UPDATE wallet_accounts
        SET balance_paisa = balance_paisa - ${input.amountPaisa},
            updated_at = NOW()
        WHERE id = (SELECT id FROM wallet_accounts ORDER BY id ASC LIMIT 1)
      ),
      goal_update AS (
        UPDATE savings_goals
        SET saved_paisa = LEAST(saved_paisa + ${input.amountPaisa}, target_paisa)
        WHERE id = ${input.id}
        RETURNING *
      )
      SELECT * FROM goal_update
    `;
    if (rows.length === 0) return null;

    // Sync saving_paisa aggregate
    await sql`
      UPDATE wallet_accounts
      SET saving_paisa = (SELECT COALESCE(SUM(saved_paisa), 0) FROM savings_goals),
          updated_at = NOW()
      WHERE id = (SELECT id FROM wallet_accounts ORDER BY id ASC LIMIT 1)
    `;
    return mapGoalRow(rows[0]);
  }

  return withLocalLock(async () => {
    const db = await readLocalDb();
    const idx = db.goals.findIndex((g) => g.id === input.id);
    if (idx === -1) return null;
    const goal = db.goals[idx];
    if (db.wallet.balancePaisa < input.amountPaisa) {
      throw new Error("Insufficient balance");
    }
    db.wallet.balancePaisa -= input.amountPaisa;
    const updated: Goal = {
      ...goal,
      savedPaisa: Math.min(goal.savedPaisa + input.amountPaisa, goal.targetPaisa),
    };
    db.goals[idx] = updated;
    db.wallet.savingPaisa = db.goals.reduce((s, g) => s + g.savedPaisa, 0);
    db.wallet.updatedAt = new Date().toISOString();
    await writeLocalDb(db);
    return updated;
  });
}

export async function deleteGoalRecord(id: number): Promise<boolean> {
  const mode = getStorageMode();
  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    const rows = await sql`
      DELETE FROM savings_goals WHERE id = ${id} RETURNING id
    `;
    return rows.length > 0;
  }

  return withLocalLock(async () => {
    const db = await readLocalDb();
    const prevLen = db.goals.length;
    db.goals = db.goals.filter((g) => g.id !== id);
    if (db.goals.length === prevLen) return false;
    db.wallet.savingPaisa = db.goals.reduce((s, g) => s + g.savedPaisa, 0);
    await writeLocalDb(db);
    return true;
  });
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function getOverviewData(
  requestedMonth?: string
): Promise<OverviewResponse> {
  const dashboard = await getDashboardData();
  const now = new Date();
  const currentMonthName = MONTH_NAMES[now.getMonth()];

  const txMonths = new Set<string>([currentMonthName]);
  for (const tx of dashboard.transactions) {
    const dt = new Date(tx.createdAt);
    if (!Number.isNaN(dt.getTime())) {
      txMonths.add(MONTH_NAMES[dt.getMonth()]);
    }
  }

  const availableMonths = MONTH_NAMES.filter((m) => txMonths.has(m));
  const selectedMonth =
    requestedMonth && availableMonths.includes(requestedMonth)
      ? requestedMonth
      : currentMonthName;

  const selectedMonthIdx = MONTH_NAMES.indexOf(selectedMonth);
  const monthTxs = dashboard.transactions.filter((tx) => {
    const dt = new Date(tx.createdAt);
    return dt.getMonth() === selectedMonthIdx && tx.status === "Completed";
  });

  let incomePaisa = 0;
  let spendPaisa = 0;
  let billsPaisa = 0;
  const catMap = new Map<string, { amountPaisa: number; count: number }>();

  for (const tx of monthTxs) {
    if (tx.direction === "credit") {
      incomePaisa += tx.amountPaisa;
    } else if (tx.direction === "debit") {
      spendPaisa += tx.amountPaisa;
      if (tx.category === "Bills" || tx.category === "Subscription") {
        billsPaisa += tx.amountPaisa;
      }
      const prev = catMap.get(tx.category) ?? { amountPaisa: 0, count: 0 };
      catMap.set(tx.category, {
        amountPaisa: prev.amountPaisa + tx.amountPaisa,
        count: prev.count + 1,
      });
    }
  }

  const netSavingsPaisa = Math.max(incomePaisa - spendPaisa, 0);
  const denom = Math.max(incomePaisa, spendPaisa, 1);
  const spendRatio = Math.min(Math.round((spendPaisa / denom) * 100), 100);
  const savingsRatio = Math.max(
    0,
    Math.min(Math.round(((incomePaisa - spendPaisa) / denom) * 100), 100)
  );
  const taxEstimateRatio = incomePaisa > 0 ? 10 : 0;

  // 7-day rolling spend buckets (Mon..Sun labels from last 7 days)
  const dayBuckets: { label: string; key: string; amountPaisa: number }[] = [];
  const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    const key = d.toISOString().slice(0, 10);
    dayBuckets.push({
      label: shortDays[d.getDay()],
      key,
      amountPaisa: 0,
    });
  }

  for (const tx of monthTxs) {
    if (tx.direction !== "debit") continue;
    const key = new Date(tx.createdAt).toISOString().slice(0, 10);
    const bucket = dayBuckets.find((b) => b.key === key);
    if (bucket) {
      bucket.amountPaisa += tx.amountPaisa;
    }
  }

  const maxDayPaisa = Math.max(...dayBuckets.map((b) => b.amountPaisa), 1);
  const weekly = dayBuckets.map((b) => ({
    label: b.label,
    amountPaisa: b.amountPaisa,
    percentOfMax: Math.round((b.amountPaisa / maxDayPaisa) * 100),
  }));

  const categories = Array.from(catMap.entries())
    .map(([name, info]) => ({
      name,
      amountPaisa: info.amountPaisa,
      percent:
        spendPaisa > 0 ? Math.round((info.amountPaisa / spendPaisa) * 100) : 0,
      count: info.count,
    }))
    .sort((a, b) => b.amountPaisa - a.amountPaisa);

  return {
    storageMode: dashboard.storageMode,
    selectedMonth,
    availableMonths,
    wallet: dashboard.wallet,
    totals: {
      incomePaisa,
      spendPaisa,
      billsPaisa,
      netSavingsPaisa,
      spendRatio,
      savingsRatio,
      taxEstimateRatio,
    },
    weekly,
    categories,
    recentTransactions: monthTxs.slice(0, 5),
  };
}

// ─── Chat History ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number;
  role: "user" | "ai";
  content: string;
  createdAt: string;
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  const mode = getStorageMode();
  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    const rows = await sql`
      SELECT id, role, content, created_at FROM chat_messages ORDER BY created_at ASC, id ASC
    `;
    return rows.map((r) => ({
      id: Number(r.id),
      role: r.role as "user" | "ai",
      content: String(r.content),
      createdAt: String(r.created_at),
    }));
  }
  // Local fallback: no persistence
  return [];
}

export async function saveChatMessage(
  role: "user" | "ai",
  content: string
): Promise<void> {
  const mode = getStorageMode();
  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    await sql`
      INSERT INTO chat_messages (role, content) VALUES (${role}, ${content})
    `;
  }
  // Local mode: no-op (in-memory only)
}

export async function clearChatHistory(): Promise<void> {
  const mode = getStorageMode();
  if (mode === "neon") {
    await ensureNeonSchema();
    const sql = getNeonSql();
    await sql`DELETE FROM chat_messages`;
  }
}
