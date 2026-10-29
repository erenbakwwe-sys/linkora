import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';

export interface Wallet {
  id: string;
  tenantId: string;
  balance: number;
  creditLimit: number;
  currency: string;
  isLocked: boolean;
  lowBalanceThreshold: number;
}

export interface LedgerEntry {
  id: string;
  tenantId: string;
  walletId: string;
  txType: 'LEAD_SALE_CREDIT' | 'LEAD_PURCHASE_DEBIT' | 'REFUND_CREDIT' | 'TELEPHONY_MINUTE_DEBIT' | 'WALLET_TOPUP';
  amount: number; // positive = credit, negative = debit
  balanceAfter: number;
  referenceType: 'LEAD_SALE' | 'RETURN' | 'TELEPHONY_SESSION' | 'TOPUP';
  referenceId: string;
  idempotencyKey: string;
  description: string;
  createdAt: string;
}

@Injectable()
export class WalletLedgerService {
  private readonly inMemoryWallets: Map<string, Wallet> = new Map();
  private readonly inMemoryLedger: LedgerEntry[] = [];
  private readonly idempotencyKeys: Set<string> = new Set();

  constructor(private readonly db: DatabaseService) {
    this.seedDefaultWallets();
  }

  private seedDefaultWallets() {
    // Platform tenant wallet
    this.inMemoryWallets.set('11111111-1111-1111-1111-111111111111', {
      id: 'wallet-tenant-main',
      tenantId: '11111111-1111-1111-1111-111111111111',
      balance: 1450.5,
      creditLimit: 500.0,
      currency: 'EUR',
      isLocked: false,
      lowBalanceThreshold: 10.0,
    });

    // Sample Buyer Wallet (Solar Direkt GmbH)
    this.inMemoryWallets.set('buyer-solar-direkt-wallet', {
      id: 'wallet-buyer-1',
      tenantId: '11111111-1111-1111-1111-111111111111',
      balance: 2800.0,
      creditLimit: 1000.0,
      currency: 'EUR',
      isLocked: false,
      lowBalanceThreshold: 50.0,
    });
  }

  public getWallet(tenantOrWalletId: string): Wallet {
    let wallet = this.inMemoryWallets.get(tenantOrWalletId);
    if (!wallet) {
      // Find by tenantId
      for (const w of this.inMemoryWallets.values()) {
        if (w.tenantId === tenantOrWalletId) return w;
      }
      // Create on the fly
      wallet = {
        id: `wallet-${randomUUID()}`,
        tenantId: tenantOrWalletId,
        balance: 500.0,
        creditLimit: 200.0,
        currency: 'EUR',
        isLocked: false,
        lowBalanceThreshold: 10.0,
      };
      this.inMemoryWallets.set(tenantOrWalletId, wallet);
    }
    return wallet;
  }

  /**
   * Applies an immutable double-entry ledger entry to a wallet with strict idempotency.
   */
  public applyLedgerTransaction(params: {
    tenantId: string;
    walletId: string;
    txType: LedgerEntry['txType'];
    amount: number; // positive = add to wallet, negative = deduct from wallet
    referenceType: LedgerEntry['referenceType'];
    referenceId: string;
    idempotencyKey: string;
    description: string;
  }): LedgerEntry {
    if (this.idempotencyKeys.has(params.idempotencyKey)) {
      // Idempotency: return existing entry without reapplying
      const existing = this.inMemoryLedger.find((l) => l.idempotencyKey === params.idempotencyKey);
      if (existing) return existing;
    }

    const wallet = this.getWallet(params.walletId);

    // Overdraft protection check
    if (params.amount < 0 && wallet.balance + params.amount < -wallet.creditLimit) {
      throw new BadRequestException(
        `Guthaben unzureichend. Verfügbares Guthaben inkl. Kreditlinie: ${(
          wallet.balance + wallet.creditLimit
        ).toFixed(2)} €.`
      );
    }

    const newBalance = Number((wallet.balance + params.amount).toFixed(4));
    wallet.balance = newBalance;

    const entry: LedgerEntry = {
      id: `ledg-${randomUUID()}`,
      tenantId: params.tenantId,
      walletId: wallet.id,
      txType: params.txType,
      amount: params.amount,
      balanceAfter: newBalance,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      idempotencyKey: params.idempotencyKey,
      description: params.description,
      createdAt: new Date().toISOString(),
    };

    this.inMemoryLedger.unshift(entry);
    this.idempotencyKeys.add(params.idempotencyKey);

    return entry;
  }

  public getLedgerEntries(tenantId: string): LedgerEntry[] {
    return this.inMemoryLedger.filter((l) => l.tenantId === tenantId);
  }
}
