// state.ts
// RxJS-based state management for deterministic frontend streams.

import { BehaviorSubject, Observable, distinctUntilChanged, map, shareReplay } from 'rxjs';

// Strict domain interfaces
export interface AssetAllocation {
  readonly ticker: string;
  readonly name: string;
  readonly status: 'Active' | 'Locked' | 'Pending';
  readonly allocationPct: number;
  readonly netYield: number;
}

export interface VaultProfile {
  readonly enclaveId: string;
  readonly totalValueLocked: number;
  readonly netYield: number;
  readonly assets: ReadonlyArray<AssetAllocation>;
  readonly lastSync: Date;
}

export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly token: string | null;
  readonly error: string | null;
}

interface AppState {
  readonly auth: AuthState;
  readonly profile: VaultProfile | null;
  readonly isLoading: boolean;
}

const initialState: AppState = {
  auth: { isAuthenticated: false, token: null, error: null },
  profile: null,
  isLoading: false
};

class VaultStore {
  private readonly stateSubject: BehaviorSubject<AppState>;
  public readonly state$: Observable<AppState>;

  // Selectors
  public readonly isAuthenticated$: Observable<boolean>;
  public readonly profile$: Observable<VaultProfile | null>;
  public readonly totalValueLocked$: Observable<number>;
  public readonly activeAssets$: Observable<ReadonlyArray<AssetAllocation>>;

  constructor() {
    this.stateSubject = new BehaviorSubject<AppState>(initialState);
    this.state$ = this.stateSubject.asObservable().pipe(shareReplay(1));

    this.isAuthenticated$ = this.select(state => state.auth.isAuthenticated);
    this.profile$ = this.select(state => state.profile);
    this.totalValueLocked$ = this.select(state => state.profile?.totalValueLocked ?? 0);
    this.activeAssets$ = this.select(state => 
      state.profile?.assets.filter(a => a.status === 'Active') ?? []
    );
  }

  private select<T>(projection: (state: AppState) => T): Observable<T> {
    return this.state$.pipe(
      map(projection),
      distinctUntilChanged()
    );
  }

  private setState(partial: Partial<AppState>): void {
    const current = this.stateSubject.getValue();
    this.stateSubject.next({ ...current, ...partial });
  }

  public setAuthState(auth: Partial<AuthState>): void {
    const currentAuth = this.stateSubject.getValue().auth;
    this.setState({ auth: { ...currentAuth, ...auth } });
  }

  public setProfile(profile: VaultProfile): void {
    this.setState({ profile, isLoading: false });
  }

  public setLoading(isLoading: boolean): void {
    this.setState({ isLoading });
  }

  public reset(): void {
    this.stateSubject.next(initialState);
  }
}

// Singleton instance
export const vaultStore = new VaultStore();

// API integration layer
export async function fetchVaultProfile(token: string): Promise<VaultProfile> {
  vaultStore.setLoading(true);
  try {
    const response = await fetch('/api/v1/vault/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to decrypt vault profile');
    
    const data = await response.json();
    
    // Map API response to strict domain model
    const profile: VaultProfile = {
      enclaveId: data.enclave_id,
      totalValueLocked: data.total_value_locked,
      netYield: data.net_yield,
      assets: data.assets.map((a: any) => ({
        ticker: a.ticker,
        name: a.name,
        status: a.status,
        allocationPct: a.allocation_pct,
        netYield: a.net_yield
      })),
      lastSync: new Date(data.last_sync)
    };

    vaultStore.setProfile(profile);
    return profile;
  } catch (error) {
    vaultStore.setAuthState({ error: (error as Error).message });
    vaultStore.setLoading(false);
    throw error;
  }
}
