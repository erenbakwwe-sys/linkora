import { calculateAuditHash } from '../src/rls.js';

describe('Tamper-Evident Hash Chain Audit Log', () => {
  it('should compute deterministic SHA-256 hash', () => {
    const prevHash = '0'.repeat(64);
    const hash1 = calculateAuditHash(
      prevHash,
      'leads',
      'lead-123',
      'LEAD_CREATED',
      'user-456',
      '2026-10-28T12:00:00Z',
      { status: 'NEW' }
    );

    expect(hash1).toHaveLength(64);

    const hash2 = calculateAuditHash(
      prevHash,
      'leads',
      'lead-123',
      'LEAD_CREATED',
      'user-456',
      '2026-10-28T12:00:00Z',
      { status: 'NEW' }
    );

    expect(hash1).toBe(hash2);
  });

  it('should detect any tampering in the payload diff', () => {
    const prevHash = '0'.repeat(64);
    const hashOriginal = calculateAuditHash(
      prevHash,
      'leads',
      'lead-123',
      'LEAD_CREATED',
      'user-456',
      '2026-10-28T12:00:00Z',
      { phone: '+491711234567' }
    );

    const hashTampered = calculateAuditHash(
      prevHash,
      'leads',
      'lead-123',
      'LEAD_CREATED',
      'user-456',
      '2026-10-28T12:00:00Z',
      { phone: '+491799999999' } // tampered
    );

    expect(hashOriginal).not.toBe(hashTampered);
  });

  it('should chain sequentially and detect broken links', () => {
    const h0 = '0'.repeat(64);
    const h1 = calculateAuditHash(h0, 'leads', '1', 'CREATE', 'u1', '2026-10-28T12:01:00Z', {});
    const h2 = calculateAuditHash(h1, 'leads', '1', 'UPDATE', 'u1', '2026-10-28T12:02:00Z', { status: 'CONFIRMED' });
    const h3 = calculateAuditHash(h2, 'leads', '1', 'SOLD', 'u2', '2026-10-28T12:03:00Z', { buyerId: 'b1' });

    expect(h1).not.toBe(h2);
    expect(h2).not.toBe(h3);

    // If an attacker replaces h1 with another hash, h2 will not link
    const recalculatedH2 = calculateAuditHash(
      'bad_fake_hash'.padEnd(64, '0'),
      'leads',
      '1',
      'UPDATE',
      'u1',
      '2026-10-28T12:02:00Z',
      { status: 'CONFIRMED' }
    );
    expect(recalculatedH2).not.toBe(h2);
  });
});
