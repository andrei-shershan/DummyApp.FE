import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CurrentUser, ArtworkDto, AdminUserDto, ArtworkCreateRequest, RoleDto, BasketItemDto, PrintSizeDto } from '../types/api';
import { getCurrentUser } from '../api/auth';
import { createArtwork as createArtworkApi, getArtworkById, getArtworks, toggleArtworkActive as toggleArtworkActiveApi } from '../api/artworks';
import { getAdminUsers, getRoles, getPrintSizes, toggleUserActive as toggleUserActiveApi } from '../api/admin';
import { sendInvite as sendInviteApi } from '../api/invite';
import { getBasketSummary, reviewBasket as reviewBasketApi, activateBasket as activateBasketApi, updateBasketItemQuantity as updateBasketItemQuantityApi } from '../api/basket';
import { checkoutBasket } from '../api/payment';

interface AppContextState {
  user: CurrentUser | null;
  artworks: ArtworkDto[];
  selectedArtwork: ArtworkDto | null;
  adminUsers: AdminUserDto[];
  adminRoles: RoleDto[];
  printSizes: PrintSizeDto[];
  basketItems: BasketItemDto[];
  basketStatus: string | null;
  basketCount: number;
  basketLoading: boolean;
  basketError: string | null;
  loading: boolean;
  loadingDetail: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  refreshArtworks: (creatorId?: string, isActive?: boolean) => Promise<void>;
  refreshAdminData: () => Promise<void>;
  refreshBasketItems: () => Promise<void>;
  payBasket: () => Promise<void>;
  payOrder: () => Promise<string>;
  activateBasket: () => Promise<void>;
  updateBasketItemQuantity: (artworkId: string, quantity: number, printSizeId?: number, priceId?: number) => Promise<void>;
  loadArtworkById: (id: string, activeOnly?: boolean) => Promise<void>;
  toggleArtworkActive: (id: string) => Promise<void>;
  toggleUserActive: (userId: string, isActive: boolean) => Promise<void>;
  createArtwork: (data: ArtworkCreateRequest) => Promise<ArtworkDto>;
  isArtworkInBasket: (artworkId: string) => boolean;
  sendInvite: (email: string) => Promise<void>;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [artworks, setArtworks] = useState<ArtworkDto[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkDto | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserDto[]>([]);
  const [adminRoles, setAdminRoles] = useState<RoleDto[]>([]);
  const [printSizes, setPrintSizes] = useState<PrintSizeDto[]>([]);
  const [basketItems, setBasketItems] = useState<BasketItemDto[]>([]);
  const [basketStatus, setBasketStatus] = useState<string | null>(null);
  const [basketCount, setBasketCount] = useState(0);
  const [basketLoading, setBasketLoading] = useState(false);
  const [basketError, setBasketError] = useState<string | null>(null);
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
      const [users, roles, sizes] = await Promise.all([getAdminUsers(), getRoles(), getPrintSizes()]);
      setAdminUsers(users);
      setAdminRoles(roles);
      setPrintSizes(sizes);
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

  const refreshBasketItems = useCallback(async () => {
    setBasketLoading(true);
    setBasketError(null);

    try {
      const summary = await getBasketSummary();
      if (summary === null) {
        setBasketItems([]);
        setBasketStatus(null);
        setBasketCount(0);
      } else {
        setBasketItems(summary.items);
        setBasketStatus(summary.status);
        setBasketCount(summary.items.reduce((sum, item) => sum + item.quantity, 0));
      }
      setBasketError(null);
    } catch (err: any) {
      setBasketItems([]);
      setBasketStatus(null);
      setBasketCount(0);
      setBasketError(err?.message ?? 'Unable to load basket summary.');
    } finally {
      setBasketLoading(false);
    }
  }, []);

  const payBasket = useCallback(async () => {
    try {
      await reviewBasketApi();
      await refreshBasketItems();
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to pay for basket.');
      throw err;
    }
  }, [refreshBasketItems]);

  const payOrder = useCallback(async () => {
    try {
      const url = await checkoutBasket();
      setError(null);
      return url;
    } catch (err: any) {
      setError(err?.message ?? 'Unable to start checkout.');
      throw err;
    }
  }, []);

  const activateBasket = useCallback(async () => {
    try {
      await activateBasketApi();
      await refreshBasketItems();
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to activate basket.');
      throw err;
    }
  }, [refreshBasketItems]);

  const updateBasketItemQuantity = useCallback(async (artworkId: string, quantity: number, printSizeId?: number, priceId?: number) => {
    try {
      await updateBasketItemQuantityApi(artworkId, quantity, printSizeId, priceId);
      await refreshBasketItems();
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to update basket item.');
      throw err;
    }
  }, [refreshBasketItems]);

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

  const isArtworkInBasket = useCallback((artworkId: string) => {
    return basketItems.some(item => item.artworkId === artworkId);
  }, [basketItems]);

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
      await Promise.all([refreshUser(), refreshArtworks(), refreshBasketItems()]);
      setLoading(false);
    }

    initialize().catch(() => {
      setLoading(false);
    });
  }, [refreshArtworks, refreshUser, refreshBasketItems]);

  return (
    <AppContext.Provider
      value={{
        user,
        artworks,
        selectedArtwork,
        adminUsers,
        adminRoles,
        printSizes,
        basketItems,
        basketStatus,
        basketCount,
        basketLoading,
        basketError,
        loading,
        loadingDetail,
        error,
        refreshUser,
        refreshArtworks,
        refreshAdminData,
        refreshBasketItems,
        payBasket,
        payOrder,
        activateBasket,
        updateBasketItemQuantity,
        loadArtworkById,
        toggleArtworkActive,
        toggleUserActive,
        createArtwork,
        isArtworkInBasket,
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
