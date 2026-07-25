import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CurrentUser, ArtworkDto, AdminUserDto, ArtworkCreateRequest, RoleDto } from '../types/api';
import { getCurrentUser } from '../api/auth';
import { createArtwork as createArtworkApi, getArtworkById, getArtworks, toggleArtworkActive as toggleArtworkActiveApi } from '../api/artworks';
import { getAdminUsers, getRoles, toggleUserActive as toggleUserActiveApi } from '../api/admin';
import { sendInvite as sendInviteApi } from '../api/invite';

interface AppContextState {
  user: CurrentUser | null;
  artworks: ArtworkDto[];
  selectedArtwork: ArtworkDto | null;
  adminUsers: AdminUserDto[];
  adminRoles: RoleDto[];
  loading: boolean;
  loadingDetail: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  refreshArtworks: (creatorId?: string, isActive?: boolean) => Promise<void>;
  refreshAdminData: () => Promise<void>;
  loadArtworkById: (id: string, activeOnly?: boolean) => Promise<void>;
  toggleArtworkActive: (id: string) => Promise<void>;
  toggleUserActive: (userId: string, isActive: boolean) => Promise<void>;
  createArtwork: (data: ArtworkCreateRequest) => Promise<ArtworkDto>;
  sendInvite: (email: string) => Promise<void>;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [artworks, setArtworks] = useState<ArtworkDto[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkDto | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserDto[]>([]);
  const [adminRoles, setAdminRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err: any) {
      setUser({ isAuthenticated: false });
      setError(err?.message ?? 'Unable to load user information.');
    }
  }, []);

  const refreshArtworks = useCallback(async (creatorId?: string, isActive = true) => {
    try {
      const artworkList = await getArtworks(creatorId, isActive);
      setArtworks(artworkList);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load artworks.');
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    try {
      const [users, roles] = await Promise.all([getAdminUsers(), getRoles()]);
      setAdminUsers(users);
      setAdminRoles(roles);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load admin data.');
    }
  }, []);

  const loadArtworkById = useCallback(async (id: string, activeOnly = true) => {
    setLoadingDetail(true);
    try {
      const artwork = await getArtworkById(id, activeOnly);
      setSelectedArtwork(artwork);
      setError(null);
    } catch (err: any) {
      setSelectedArtwork(null);
      setError(err?.message ?? 'Unable to load artwork details.');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const toggleArtworkActive = useCallback(async (id: string) => {
    if (!selectedArtwork) {
      throw new Error('Selected artwork is required to toggle active state.');
    }

    try {
      const updatedArtwork = await toggleArtworkActiveApi(id, !selectedArtwork.isActive);
      setSelectedArtwork(prev => (prev?.id === updatedArtwork.id ? updatedArtwork : prev));
      setArtworks(prev => prev.map(item => (item.id === updatedArtwork.id ? updatedArtwork : item)));
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to update artwork status.');
      throw err;
    }
  }, [selectedArtwork]);

  const createArtwork = useCallback(async (data: import('../types/api').ArtworkCreateRequest) => {
    try {
      const artwork = await createArtworkApi(data);
      setArtworks(prev => [artwork, ...prev]);
      setError(null);
      return artwork;
    } catch (err: any) {
      setError(err?.message ?? 'Unable to create artwork.');
      throw err;
    }
  }, []);

  const toggleUserActive = useCallback(async (userId: string, isActive: boolean) => {
    try {
      await toggleUserActiveApi(userId, isActive);
      await refreshAdminData();
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to update user status.');
      throw err;
    }
  }, [refreshAdminData]);

  const sendInvite = useCallback(async (email: string) => {
    try {
      await sendInviteApi(email);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to send invite.');
      throw err;
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      await Promise.all([refreshUser(), refreshArtworks()]);
      setLoading(false);
    }

    initialize().catch(() => {
      setLoading(false);
    });
  }, [refreshArtworks, refreshUser]);

  return (
    <AppContext.Provider
      value={{
        user,
        artworks,
        selectedArtwork,
        adminUsers,
        adminRoles,
        loading,
        loadingDetail,
        error,
        refreshUser,
        refreshArtworks,
        refreshAdminData,
        loadArtworkById,
        toggleArtworkActive,
        toggleUserActive,
        createArtwork,
        sendInvite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
}
