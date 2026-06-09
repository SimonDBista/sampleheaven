import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Force mock local storage fallback if the supabase key is not a valid JWT (i.e. starts with 'eyJ' or 'sb_publishable_')
export const isRealSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && (supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.startsWith('sb_publishable_')));

export const supabase = isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// New Database Table fallbacks in localStorage
const STORAGE_KEYS = {
  CURRENT_USER: 'samplegoldmine_user_session_v2',
  USERS: 'samplegoldmine_tbl_users_v2',
  SELLER_PROFILES: 'samplegoldmine_tbl_seller_profiles_v2',
  PRODUCTS: 'samplegoldmine_tbl_products_v2',
  ORDERS: 'samplegoldmine_tbl_orders_v2',
  LIKED: 'samplegoldmine_liked_products_v2',
  FOLLOWED: 'samplegoldmine_followed_creators_v2'
};

// Types & Interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'Buyer' | 'Seller' | 'Admin' | null;
  created_at: string;
  isVerified?: boolean;
  isSuspended?: boolean;
  profile_picture_url?: string;
}

export interface SellerProfile {
  user_id: string;
  display_name: string;
  instagram_username: string;
  profile_picture_url: string; // url or base64 dataurl
  qr_image_url: string; // payment QR code image url or base64 dataurl
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name: string; // joined display name
  title: string;
  description: string;
  type: 'Beat' | 'Pack' | 'One-Shot' | 'Loop' | 'Kit';
  genre: string;
  price: number; // must be 0 for One-Shot
  file_url: string;
  tags: string[];
  bpm?: number | null;
  scale_key?: string | null;
  downloads?: number;
  created_at: string;
  cover_art_url?: string | null;
}

export interface Order {
  id: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  product_type?: 'Beat' | 'Pack' | 'One-Shot' | 'Loop' | 'Kit';
  status: 'pending' | 'approved' | 'rejected';
  payment_method: 'eSewa' | 'Khalti' | 'Bank Transfer';
  payment_proof_url?: string;
  created_at: string;
}

// Storage Helpers
const getLocalData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`localStorage write error for key ${key}:`, e);
  }
};

export const isUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const getCoverArtUrl = (coverArtPath: string | null | undefined): string | undefined => {
  if (!coverArtPath) return undefined;
  if (coverArtPath.startsWith('data:') || coverArtPath.startsWith('http')) {
    return coverArtPath;
  }
  return `${supabaseUrl}/storage/v1/object/public/samples/${encodeURIComponent(coverArtPath)}`;
};

// Initialize Mock Database Tables if empty
export const initializeDatabase = () => {
  if (typeof window === 'undefined') return;

  // 1. Seed Users List
  const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    const seedUsers: User[] = [
      { id: 'usr-admin', email: 'admin@samplegoldmine.com', username: 'Admin', role: 'Admin', isVerified: true, isSuspended: false, created_at: new Date().toISOString(), profile_picture_url: '' },
      { id: 'usr-kvng', email: 'producer@samplegoldmine.com', username: 'KVNG Beats', role: 'Seller', isVerified: true, isSuspended: false, created_at: new Date().toISOString(), profile_picture_url: '' },
      { id: 'usr-chill', email: 'chill@samplegoldmine.com', username: 'ChillWave', role: 'Seller', isVerified: false, isSuspended: false, created_at: new Date().toISOString(), profile_picture_url: '' },
      { id: 'usr-forge', email: 'forge@samplegoldmine.com', username: 'SoundForge', role: 'Seller', isVerified: true, isSuspended: false, created_at: new Date().toISOString(), profile_picture_url: '' },
      { id: 'usr-buyer', email: 'listener1@samplegoldmine.com', username: 'AlexMercer', role: 'Buyer', isVerified: false, isSuspended: false, created_at: new Date().toISOString(), profile_picture_url: '' },
      { id: 'usr-new', email: 'producer@samplegoldmine.com', username: 'NewProducer', role: 'Seller', isVerified: false, isSuspended: false, created_at: new Date().toISOString(), profile_picture_url: '' }
    ];
    setLocalData(STORAGE_KEYS.USERS, seedUsers);
  } else if (!users.some(u => u.id === 'usr-admin')) {
    users.push({ id: 'usr-admin', email: 'admin@samplegoldmine.com', username: 'Admin', role: 'Admin', isVerified: true, isSuspended: false, created_at: new Date().toISOString(), profile_picture_url: '' });
    setLocalData(STORAGE_KEYS.USERS, users);
  }

  // 2. Seed Seller Profiles
  const profiles = getLocalData<SellerProfile[]>(STORAGE_KEYS.SELLER_PROFILES, []);
  if (profiles.length === 0) {
    const seedProfiles: SellerProfile[] = [
      {
        user_id: 'usr-kvng',
        display_name: 'KVNG Beats',
        instagram_username: 'kvngbeats_official',
        profile_picture_url: '',
        qr_image_url: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=200&h=200&auto=format&fit=crop', // mock QR code
        updated_at: new Date().toISOString()
      },
      {
        user_id: 'usr-chill',
        display_name: 'ChillWave',
        instagram_username: 'chillwave_vibes',
        profile_picture_url: '',
        qr_image_url: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=200&h=200&auto=format&fit=crop',
        updated_at: new Date().toISOString()
      },
      {
        user_id: 'usr-forge',
        display_name: 'SoundForge Studio',
        instagram_username: 'soundforge_fx',
        profile_picture_url: '',
        qr_image_url: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=200&h=200&auto=format&fit=crop',
        updated_at: new Date().toISOString()
      }
    ];
    setLocalData(STORAGE_KEYS.SELLER_PROFILES, seedProfiles);
  }

  // 3. Seed Products List (Beats, Sample Packs, One-Shots)
  const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  if (products.length === 0) {
    const seedProducts: Product[] = [
      {
        id: 'prod-1',
        seller_id: 'usr-kvng',
        seller_name: 'KVNG Beats',
        title: 'Midnight 808 Punch',
        description: 'Hard-hitting 808s, designed for modern trap production.',
        type: 'One-Shot',
        genre: 'Trap',
        price: 0,
        file_url: '808_punch.wav',
        tags: ['808', 'dark', 'trap', 'punch'],
        bpm: null,
        scale_key: 'C',
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-2',
        seller_id: 'usr-chill',
        seller_name: 'ChillWave',
        title: 'Lo-Fi Jazz Piano Loop',
        description: 'Dusty piano chords detuned keyboard progression.',
        type: 'Loop',
        genre: 'Lo-Fi',
        price: 0,
        file_url: 'jazz_keys.wav',
        tags: ['piano', 'lofi', 'loop', 'jazz'],
        bpm: 85,
        scale_key: 'Dm',
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-3',
        seller_id: 'usr-kvng',
        seller_name: 'KVNG Beats',
        title: 'Midnight Trap Essentials',
        description: 'Standard trap kit sample pack containing 808s and loops.',
        type: 'Pack',
        genre: 'Trap',
        price: 19.99,
        file_url: 'midnight_trap.zip',
        tags: ['kit', 'trap', 'pack', 'essentials'],
        bpm: 140,
        scale_key: null,
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-4',
        seller_id: 'usr-forge',
        seller_name: 'SoundForge Studio',
        title: 'Cinematic Tension Riser',
        description: 'Tense riser sweep for gaming and film composition.',
        type: 'One-Shot',
        genre: 'Cinematic',
        price: 0,
        file_url: 'riser.wav',
        tags: ['riser', 'sfx', 'cinematic', 'free'],
        bpm: null,
        scale_key: null,
        created_at: new Date().toISOString()
      }
    ];
    setLocalData(STORAGE_KEYS.PRODUCTS, seedProducts);
  }

  // 4. Seed Orders (Orders approve manual payments)
  const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
  if (orders.length === 0) {
    const seedOrders: Order[] = [
      {
        id: 'order-1',
        buyer_id: 'usr-buyer',
        buyer_name: 'AlexMercer',
        seller_id: 'usr-kvng',
        product_id: 'prod-3',
        product_title: 'Midnight Trap Essentials',
        product_price: 19.99,
        product_type: 'Pack',
        status: 'pending',
        payment_method: 'eSewa',
        created_at: new Date().toISOString()
      }
    ];
    setLocalData(STORAGE_KEYS.ORDERS, seedOrders);
  }
};

// Run initialization in browser context
if (typeof window !== 'undefined') {
  initializeDatabase();
}

// ----------------------------------------------------
// DB Services API Bindings (Next.js + Supabase client)
// ----------------------------------------------------

// 1. Auth Service
export const authService = {
  getCurrentUser: (): User | null => {
    return getLocalData<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  signInWithGoogle: async (): Promise<{ data: any; error: any }> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/role-selection`
        }
      });
      return { data, error };
    }

    // Mock Google sign in
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if mock user session already exists
    let existingSession = getLocalData<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (!existingSession) {
      // Create new user without a role
      const mockGoogleUser: User = {
        id: 'usr-google123',
        email: 'google.producer@gmail.com',
        username: 'GoogleProducer',
        role: null, // forced to select role
        created_at: new Date().toISOString()
      };
      
      // Save to global user database list
      const usersList = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
      if (!usersList.some(u => u.id === mockGoogleUser.id)) {
        usersList.push(mockGoogleUser);
        setLocalData(STORAGE_KEYS.USERS, usersList);
      }
      
      setLocalData(STORAGE_KEYS.CURRENT_USER, mockGoogleUser);
      existingSession = mockGoogleUser;
    }
    
    return { data: existingSession, error: null };
  },

  signUp: async (username: string, email: string, password?: string): Promise<{ data: User | null; error: string | null }> => {
    if (isRealSupabaseConfigured && supabase) {
      if (!password) {
        return { data: null, error: 'Password is required for registration.' };
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      if (error) {
        return { data: null, error: error.message };
      }
      if (data.user) {
        const userObj: User = {
          id: data.user.id,
          email: data.user.email || email,
          username,
          role: null,
          created_at: new Date().toISOString(),
          profile_picture_url: ''
        };
        setLocalData(STORAGE_KEYS.CURRENT_USER, userObj);
        return { data: userObj, error: null };
      }
      return { data: null, error: 'Registration succeeded but session could not be established.' };
    }

    // Mock registration fallback
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
      return { data: null, error: 'Username or Email already exists.' };
    }
    const newUser: User = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      email,
      username,
      role: null,
      created_at: new Date().toISOString(),
      profile_picture_url: ''
    };
    users.push(newUser);
    setLocalData(STORAGE_KEYS.USERS, users);
    setLocalData(STORAGE_KEYS.CURRENT_USER, newUser);
    return { data: newUser, error: null };
  },

  // Fallback direct login for testing other accounts
  logIn: async (usernameOrEmail: string, password?: string): Promise<{ data: User | null; error: string | null }> => {
    if (isRealSupabaseConfigured && supabase) {
      if (!password) {
        return { data: null, error: 'Password is required to sign in.' };
      }

      let email = usernameOrEmail;
      if (!usernameOrEmail.includes('@')) {
        const { data, error } = await supabase
          .from('users')
          .select('email')
          .eq('username', usernameOrEmail)
          .single();
        if (data && data.email) {
          email = data.email;
        } else {
          return { data: null, error: `Could not find an account with username "${usernameOrEmail}".` };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { data: null, error: error.message };
      }

      if (data.user) {
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (!dbError && dbUser) {
          const userObj: User = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            role: dbUser.role,
            created_at: dbUser.created_at,
            isVerified: dbUser.is_verified,
            isSuspended: dbUser.is_suspended,
            profile_picture_url: dbUser.profile_picture_url || ''
          };
          setLocalData(STORAGE_KEYS.CURRENT_USER, userObj);
          return { data: userObj, error: null };
        } else {
          const userObj: User = {
            id: data.user.id,
            email: data.user.email || email,
            username: data.user.user_metadata?.username || email.split('@')[0],
            role: null,
            created_at: new Date().toISOString(),
            profile_picture_url: ''
          };
          setLocalData(STORAGE_KEYS.CURRENT_USER, userObj);
          return { data: userObj, error: null };
        }
      }
      return { data: null, error: 'No user found' };
    }

    // Mock direct login fallback
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
    
    const matched = users.find(u => 
      u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
      u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );

    if (matched) {
      setLocalData(STORAGE_KEYS.CURRENT_USER, matched);
      return { data: matched, error: null };
    }

    // Create a new user if none matches
    const newUser: User = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@heaven.com`,
      username: usernameOrEmail.split('@')[0],
      role: null, // must select role
      created_at: new Date().toISOString(),
      profile_picture_url: ''
    };
    
    users.push(newUser);
    setLocalData(STORAGE_KEYS.USERS, users);
    setLocalData(STORAGE_KEYS.CURRENT_USER, newUser);
    return { data: newUser, error: null };
  },

  setUserRole: async (userId: string, role: 'Buyer' | 'Seller'): Promise<User | null> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) {
        // update session
        const session = authService.getCurrentUser();
        if (session && session.id === userId) {
          session.role = role;
          setLocalData(STORAGE_KEYS.CURRENT_USER, session);
        }
        return data as User;
      }
    }

    // Mock role save
    const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role };
      }
      return u;
    });
    setLocalData(STORAGE_KEYS.USERS, updated);

    // Update active user session
    const current = getLocalData<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (current && current.id === userId) {
      current.role = role;
      setLocalData(STORAGE_KEYS.CURRENT_USER, current);
      
      // If role is Seller, verify seller profile exists
      if (role === 'Seller') {
        const profiles = getLocalData<SellerProfile[]>(STORAGE_KEYS.SELLER_PROFILES, []);
        if (!profiles.some(p => p.user_id === userId)) {
          profiles.push({
            user_id: userId,
            display_name: current.username,
            instagram_username: '',
            profile_picture_url: '',
            qr_image_url: '',
            updated_at: new Date().toISOString()
          });
          setLocalData(STORAGE_KEYS.SELLER_PROFILES, profiles);
        }
      }
      return current;
    }
    return null;
  },

  logOut: async (): Promise<void> => {
    if (isRealSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }
};

// 2. Seller Profile Service
export const profileService = {
  getSellerProfile: async (userId: string): Promise<SellerProfile | null> => {
    if (userId === 'usr-admin') {
      const adminProf = adminService.getAdminProfile();
      return {
        user_id: 'usr-admin',
        display_name: adminProf.store_name,
        instagram_username: adminProf.instagram_username,
        profile_picture_url: '',
        qr_image_url: adminProf.qr_image_url,
        updated_at: adminProf.updated_at
      };
    }
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!error && data) return data as SellerProfile;
    }

    // Mock profile fetch
    const profiles = getLocalData<SellerProfile[]>(STORAGE_KEYS.SELLER_PROFILES, []);
    return profiles.find(p => p.user_id === userId) || null;
  },

  getSellerProfileByUsername: async (username: string): Promise<{ profile: SellerProfile | null; user: User | null }> => {
    const adminProf = adminService.getAdminProfile();
    if (
      username.toLowerCase() === 'usr-admin' || 
      username.toLowerCase() === 'admin' || 
      username.toLowerCase() === adminProf.store_name.toLowerCase()
    ) {
      const profile = {
        user_id: 'usr-admin',
        display_name: adminProf.store_name,
        instagram_username: adminProf.instagram_username,
        profile_picture_url: '',
        qr_image_url: adminProf.qr_image_url,
        updated_at: adminProf.updated_at
      };
      return { 
        profile, 
        user: { 
          id: 'usr-admin', 
          email: 'admin@samplegoldmine.com', 
          username: adminProf.store_name, 
          role: 'Seller', 
          created_at: new Date().toISOString() 
        } 
      };
    }

    if (isRealSupabaseConfigured && supabase) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (userError || !userData) return { profile: null, user: null };
      
      const appUser: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        created_at: userData.created_at,
        isVerified: userData.is_verified,
        isSuspended: userData.is_suspended
      };

      const profile = await profileService.getSellerProfile(appUser.id);
      return { profile, user: appUser };
    }

    const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
    const matchedUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!matchedUser) return { profile: null, user: null };
    
    const profile = await profileService.getSellerProfile(matchedUser.id);
    return { profile, user: matchedUser };
  },

  updateSellerProfile: async (userId: string, data: Partial<SellerProfile>): Promise<SellerProfile | null> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data: updated, error } = await supabase
        .from('seller_profiles')
        .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (!error && updated) {
        if (data.profile_picture_url !== undefined) {
          await supabase
            .from('users')
            .update({ profile_picture_url: data.profile_picture_url })
            .eq('id', userId);
        }
        return updated as SellerProfile;
      }
    }

    // Mock profile update
    const profiles = getLocalData<SellerProfile[]>(STORAGE_KEYS.SELLER_PROFILES, []);
    const matchIdx = profiles.findIndex(p => p.user_id === userId);
    
    const existing = profiles[matchIdx];
    const updatedProfile: SellerProfile = {
      user_id: userId,
      display_name: data.display_name !== undefined ? data.display_name : (existing?.display_name || 'Creator'),
      instagram_username: data.instagram_username !== undefined ? data.instagram_username : (existing?.instagram_username || ''),
      profile_picture_url: data.profile_picture_url !== undefined ? data.profile_picture_url : (existing?.profile_picture_url || ''),
      qr_image_url: data.qr_image_url !== undefined ? data.qr_image_url : (existing?.qr_image_url || ''),
      updated_at: new Date().toISOString()
    };
    
    if (matchIdx > -1) {
      profiles[matchIdx] = updatedProfile;
    } else {
      profiles.push(updatedProfile);
    }
    
    setLocalData(STORAGE_KEYS.SELLER_PROFILES, profiles);

    // Sync profile picture to users list & current user session in local mock DB
    if (data.profile_picture_url !== undefined) {
      const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx > -1) {
        users[userIdx].profile_picture_url = data.profile_picture_url;
        setLocalData(STORAGE_KEYS.USERS, users);
      }
      const currentUser = getLocalData<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (currentUser && currentUser.id === userId) {
        currentUser.profile_picture_url = data.profile_picture_url;
        setLocalData(STORAGE_KEYS.CURRENT_USER, currentUser);
      }
    }
    
    return updatedProfile;
  },

  updateUserProfile: async (userId: string, data: { username?: string; profile_picture_url?: string }): Promise<User | null> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data: updated, error } = await supabase
        .from('users')
        .update({
          ...(data.username ? { username: data.username } : {}),
          ...(data.profile_picture_url !== undefined ? { profile_picture_url: data.profile_picture_url } : {})
        })
        .eq('id', userId)
        .select()
        .single();
      if (!error && updated) {
        return {
          id: updated.id,
          email: updated.email,
          username: updated.username,
          role: updated.role,
          created_at: updated.created_at,
          isVerified: updated.is_verified,
          isSuspended: updated.is_suspended,
          profile_picture_url: updated.profile_picture_url
        } as User;
      }
    }

    // Mock update user profile
    const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
    const matchIdx = users.findIndex(u => u.id === userId);
    if (matchIdx > -1) {
      const updatedUser: User = {
        ...users[matchIdx],
        ...(data.username ? { username: data.username } : {}),
        ...(data.profile_picture_url !== undefined ? { profile_picture_url: data.profile_picture_url } : {})
      };
      users[matchIdx] = updatedUser;
      setLocalData(STORAGE_KEYS.USERS, users);

      // Update current user session in local mock DB
      const currentUser = getLocalData<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (currentUser && currentUser.id === userId) {
        const newSession = { ...currentUser, ...updatedUser };
        setLocalData(STORAGE_KEYS.CURRENT_USER, newSession);
      }
      return updatedUser;
    }
    return null;
  }
};

// 3. Product Service
export const productService = {
  getProducts: async (): Promise<Product[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!products_seller_id_fkey (
            username
          )
        `)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return (data as any[]).map(p => ({
          ...p,
          seller_name: p.users ? (Array.isArray(p.users) ? p.users[0]?.username : p.users.username) : 'Creator'
        })) as Product[];
      }
    }

    // Mock products fetch
    return getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  },

  getSellerProducts: async (sellerId: string): Promise<Product[]> => {
    const all = await productService.getProducts();
    return all.filter(p => p.seller_id === sellerId);
  },

  uploadProduct: async (productData: Omit<Product, 'id' | 'created_at' | 'seller_name'>): Promise<Product> => {
    // 1. One-Shot sound constraint check
    if (productData.type === 'One-Shot' && productData.price > 0) {
      throw new Error("One-Shot sounds must be offered for free only.");
    }

    const sellerProfile = await profileService.getSellerProfile(productData.seller_id);
    const displayName = sellerProfile?.display_name || 'Creator';

    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          price: productData.type === 'One-Shot' ? 0 : productData.price,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (!error && data) {
        return {
          ...data,
          seller_name: displayName
        } as Product;
      }
    }

    // Mock upload product
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const newProduct: Product = {
      id: `prod-${Math.random().toString(36).substr(2, 9)}`,
      seller_name: displayName,
      created_at: new Date().toISOString(),
      ...productData,
      price: productData.type === 'One-Shot' ? 0 : productData.price
    };
    
    products.unshift(newProduct);
    setLocalData(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  deleteProduct: async (productId: string): Promise<void> => {
    if (isRealSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', productId);
      return;
    }

    // Mock deletion
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filtered = products.filter(p => p.id !== productId);
    setLocalData(STORAGE_KEYS.PRODUCTS, filtered);
  }
};

// 4. Order Service (Manual Purchase Approval System)
export const orderService = {
  createOrder: async (buyerId: string, sellerId: string, productId: string, paymentMethod: 'eSewa' | 'Khalti' | 'Bank Transfer', paymentProofUrl?: string): Promise<Order> => {
    const buyer = getLocalData<User[]>(STORAGE_KEYS.USERS, []).find(u => u.id === buyerId);
    const buyerName = buyer?.username || 'Buyer';

    const product = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, []).find(p => p.id === productId);
    const productTitle = product?.title || 'Audio Product';
    const productPrice = product?.price || 0.00;
    const productType = product?.type || 'Beat';

    if (isRealSupabaseConfigured && supabase && isUuid(productId) && isUuid(buyerId) && isUuid(sellerId)) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId,
          status: 'pending',
          payment_method: paymentMethod,
          product_type: productType,
          payment_proof_url: paymentProofUrl || '',
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          products (
            title,
            price
          ),
          buyer:buyer_id (
            username
          )
        `)
        .single();
      if (!error && data) {
        const orderObj = {
          ...data,
          product_title: data.products ? (Array.isArray(data.products) ? data.products[0]?.title : data.products.title) : productTitle,
          product_price: data.products ? (Array.isArray(data.products) ? data.products[0]?.price : data.products.price) : productPrice,
          buyer_name: data.buyer ? (Array.isArray(data.buyer) ? data.buyer[0]?.username : data.buyer.username) : buyerName
        } as unknown as Order;

        // Sync local storage orders
        const localOrders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
        localOrders.unshift(orderObj);
        setLocalData(STORAGE_KEYS.ORDERS, localOrders);

        return orderObj;
      }
    }

    // Mock create order
    const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
    const newOrder: Order = {
      id: `order-${Math.random().toString(36).substr(2, 9)}`,
      buyer_id: buyerId,
      buyer_name: buyerName,
      seller_id: sellerId,
      product_id: productId,
      product_title: productTitle,
      product_price: productPrice,
      product_type: productType,
      status: 'pending',
      payment_method: paymentMethod,
      payment_proof_url: paymentProofUrl || '',
      created_at: new Date().toISOString()
    };
    
    orders.unshift(newOrder);
    setLocalData(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  getBuyerOrders: async (buyerId: string): Promise<Order[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            title,
            price
          ),
          buyer:buyer_id (
            username
          )
        `)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return (data as any[]).map(o => ({
          ...o,
          product_title: o.products ? (Array.isArray(o.products) ? o.products[0]?.title : o.products.title) : 'Unknown Product',
          product_price: o.products ? (Array.isArray(o.products) ? o.products[0]?.price : o.products.price) : 0.00,
          buyer_name: o.buyer ? (Array.isArray(o.buyer) ? o.buyer[0]?.username : o.buyer.username) : 'Buyer'
        })) as Order[];
      }
      return [];
    }

    // Mock fetch buyer orders
    const all = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
    return all.filter(o => o.buyer_id === buyerId);
  },

  getSellerOrders: async (sellerId: string): Promise<Order[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            title,
            price
          ),
          buyer:buyer_id (
            username
          )
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return (data as any[]).map(o => ({
          ...o,
          product_title: o.products ? (Array.isArray(o.products) ? o.products[0]?.title : o.products.title) : 'Unknown Product',
          product_price: o.products ? (Array.isArray(o.products) ? o.products[0]?.price : o.products.price) : 0.00,
          buyer_name: o.buyer ? (Array.isArray(o.buyer) ? o.buyer[0]?.username : o.buyer.username) : 'Buyer'
        })) as Order[];
      }
      return [];
    }

    // Mock fetch seller orders
    const all = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
    return all.filter(o => o.seller_id === sellerId);
  },

  updateOrderStatus: async (orderId: string, status: 'approved' | 'rejected'): Promise<Order | null> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select(`
          *,
          products (
            title,
            price
          ),
          buyer:buyer_id (
            username
          )
        `)
        .single();
      if (!error && data) {
        const orderObj = {
          ...data,
          product_title: data.products ? (Array.isArray(data.products) ? data.products[0]?.title : data.products.title) : 'Unknown Product',
          product_price: data.products ? (Array.isArray(data.products) ? data.products[0]?.price : data.products.price) : 0.00,
          buyer_name: data.buyer ? (Array.isArray(data.buyer) ? data.buyer[0]?.username : data.buyer.username) : 'Buyer'
        } as unknown as Order;

        // Sync local storage orders
        const localOrders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
        const updatedLocal = localOrders.map(o => o.id === orderId ? orderObj : o);
        setLocalData(STORAGE_KEYS.ORDERS, updatedLocal);

        return orderObj;
      }
      return null;
    }

    // Mock order approval
    const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status };
      }
      return o;
    });
    setLocalData(STORAGE_KEYS.ORDERS, updated);
    return updated.find(o => o.id === orderId) || null;
  }
};

// 5. Interaction (Likes helper)
export const interactionService = {
  getLikedIds: (): string[] => getLocalData<string[]>(STORAGE_KEYS.LIKED, []),
  toggleLike: (productId: string): boolean => {
    const likes = getLocalData<string[]>(STORAGE_KEYS.LIKED, []);
    const idx = likes.indexOf(productId);
    let isLiked = false;
    if (idx > -1) {
      likes.splice(idx, 1);
    } else {
      likes.push(productId);
      isLiked = true;
    }
    setLocalData(STORAGE_KEYS.LIKED, likes);

    // Sync to Supabase in background
    if (isRealSupabaseConfigured && supabase && isUuid(productId)) {
      const session = authService.getCurrentUser();
      if (session) {
        if (isLiked) {
          supabase
            .from('product_likes')
            .insert({ product_id: productId, user_id: session.id })
            .then(({ error }) => {
              if (error) console.error('Failed to save like to Supabase:', error);
            });
        } else {
          supabase
            .from('product_likes')
            .delete()
            .eq('product_id', productId)
            .eq('user_id', session.id)
            .then(({ error }) => {
              if (error) console.error('Failed to remove like from Supabase:', error);
            });
        }
      }
    }
    return isLiked;
  },
  getPurchasedKitIds: (): string[] => {
    const user = authService.getCurrentUser();
    if (!user) return [];
    const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
    return orders
      .filter(o => o.buyer_id === user.id && o.status === 'approved')
      .map(o => o.product_id);
  },
  getPendingKitIds: (): string[] => {
    const user = authService.getCurrentUser();
    if (!user) return [];
    const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
    return orders
      .filter(o => o.buyer_id === user.id && o.status === 'pending')
      .map(o => o.product_id);
  },
  getFollowedCreators: (): string[] => getLocalData<string[]>(STORAGE_KEYS.FOLLOWED, []),
  toggleFollow: (username: string): boolean => {
    const followed = getLocalData<string[]>(STORAGE_KEYS.FOLLOWED, []);
    const idx = followed.indexOf(username);
    let isFollowing = false;
    if (idx > -1) {
      followed.splice(idx, 1);
    } else {
      followed.push(username);
      isFollowing = true;
    }
    setLocalData(STORAGE_KEYS.FOLLOWED, followed);

    // Sync to Supabase in background
    if (isRealSupabaseConfigured && supabase) {
      const session = authService.getCurrentUser();
      if (session) {
        // Resolve username to creator user ID
        supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single()
          .then(({ data: creatorUser, error: userError }) => {
            if (!userError && creatorUser) {
              if (isFollowing) {
                supabase
                  .from('follows')
                  .insert({ follower_id: session.id, followed_id: creatorUser.id })
                  .then(({ error }) => {
                    if (error) console.error('Failed to save follow to Supabase:', error);
                  });
              } else {
                supabase
                  .from('follows')
                  .delete()
                  .eq('follower_id', session.id)
                  .eq('followed_id', creatorUser.id)
                  .then(({ error }) => {
                    if (error) console.error('Failed to remove follow from Supabase:', error);
                  });
              }
            } else {
              console.error('Failed to resolve creator username:', userError);
            }
          });
      }
    }
    return isFollowing;
  },
  recordDownload: (sampleId: string): void => {
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const updated = products.map(p => {
      if (p.id === sampleId) {
        return { ...p, downloads: (p.downloads || 0) + 1 };
      }
      return p;
    });
    setLocalData(STORAGE_KEYS.PRODUCTS, updated);
  },
  getDownloadedIds: (): string[] => {
    const user = authService.getCurrentUser();
    if (!user) return [];
    const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
    const approvedProductIds = orders
      .filter(o => o.buyer_id === user.id && o.status === 'approved')
      .map(o => o.product_id);
    return ['sample-1', 'sample-4', ...approvedProductIds];
  },
  syncUserInteractions: async (userId: string): Promise<void> => {
    if (!isRealSupabaseConfigured || !supabase) return;
    try {
      // 1. Fetch liked products
      const { data: likesData, error: likesError } = await supabase
        .from('product_likes')
        .select('product_id')
        .eq('user_id', userId);
      
      if (!likesError && likesData) {
        const likedIds = likesData.map((l: any) => l.product_id);
        setLocalData(STORAGE_KEYS.LIKED, likedIds);
      }

      // 2. Fetch followed creators
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', userId);
      
      if (!followsError && followsData && followsData.length > 0) {
        const followedIds = followsData.map((f: any) => f.followed_id);
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('username')
          .in('id', followedIds);
        
        if (!usersError && usersData) {
          const followedUsernames = usersData.map((u: any) => u.username);
          setLocalData(STORAGE_KEYS.FOLLOWED, followedUsernames);
        }
      } else if (!followsError) {
        setLocalData(STORAGE_KEYS.FOLLOWED, []);
      }

      // 3. Fetch orders (purchases)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            title,
            price,
            type
          ),
          buyer:buyer_id (
            username
          )
        `)
        .eq('buyer_id', userId);
      
      if (!ordersError && ordersData) {
        const mappedOrders = ordersData.map((o: any) => ({
          id: o.id,
          buyer_id: o.buyer_id,
          buyer_name: o.buyer ? (Array.isArray(o.buyer) ? o.buyer[0]?.username : o.buyer.username) : 'Buyer',
          seller_id: o.seller_id,
          product_id: o.product_id,
          product_title: o.products ? (Array.isArray(o.products) ? o.products[0]?.title : o.products.title) : 'Unknown Product',
          product_price: o.products ? (Array.isArray(o.products) ? o.products[0]?.price : o.products.price) : 0.00,
          product_type: o.products ? (Array.isArray(o.products) ? o.products[0]?.type : o.products.type) : 'Beat',
          status: o.status,
          payment_method: o.payment_method,
          payment_proof_url: o.payment_proof_url,
          created_at: o.created_at
        }));
        setLocalData(STORAGE_KEYS.ORDERS, mappedOrders);
      }
    } catch (err) {
      console.error('Failed to sync user interactions:', err);
    }
  }
};

// 6. Mock User Type and Admin Service
export type MockUser = User & {
  isVerified?: boolean;
  isSuspended?: boolean;
};

export interface AdminProfile {
  store_name: string;
  instagram_username: string;
  qr_image_url: string;
  updated_at: string;
}

export const adminService = {
  getAdminProfile: (): AdminProfile => {
    return getLocalData<AdminProfile>('samplegoldmine_admin_profile', {
      store_name: 'SampleGoldmine Store',
      instagram_username: 'samplegoldmine_official',
      qr_image_url: '',
      updated_at: new Date().toISOString()
    });
  },
  updateAdminProfile: async (data: Partial<AdminProfile>, adminUserId?: string): Promise<AdminProfile> => {
    const existing = adminService.getAdminProfile();
    const updated = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString()
    };
    setLocalData('samplegoldmine_admin_profile', updated);

    if (isRealSupabaseConfigured && supabase && adminUserId) {
      // Also upsert in seller_profiles for the admin user
      await supabase
        .from('seller_profiles')
        .upsert({
          user_id: adminUserId,
          display_name: data.store_name !== undefined ? data.store_name : existing.store_name,
          instagram_username: data.instagram_username !== undefined ? data.instagram_username : existing.instagram_username,
          qr_image_url: data.qr_image_url !== undefined ? data.qr_image_url : existing.qr_image_url,
          updated_at: new Date().toISOString()
        });
    }

    return updated;
  },
  getGlobalUsers: async (): Promise<MockUser[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((u: any) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          role: u.role,
          isVerified: u.is_verified,
          isSuspended: u.is_suspended,
          created_at: u.created_at
        }));
      }
    }
    const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
    return users.map(u => ({
      ...u,
      isVerified: u.isVerified !== undefined ? u.isVerified : u.role === 'Seller',
      isSuspended: u.isSuspended !== undefined ? u.isSuspended : false
    }));
  },
  getGlobalModerationList: async (): Promise<any[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!products_seller_id_fkey (
            username
          )
        `)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((p: any) => {
          const sellerName = p.users ? (Array.isArray(p.users) ? p.users[0]?.username : p.users.username) : 'Creator';
          return {
            id: p.id,
            title: p.title,
            creator: sellerName,
            genre: p.genre,
            type: p.type === 'Pack' ? 'Kit' : p.type,
            price: p.price,
            file: p.file_url
          };
        });
      }
    }
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.map(p => ({
      id: p.id,
      title: p.title,
      creator: p.seller_name,
      genre: p.genre,
      type: p.type === 'Pack' ? 'Kit' : p.type, // Map 'Pack' to 'Kit' for admin visual branding sitemaps
      price: p.price,
      file: p.file_url
    }));
  },
  getSimulatedGeoCountry: (): string => {
    if (typeof window === 'undefined') return 'US';
    return localStorage.getItem('samplegoldmine_geo_country') || 'US';
  },
  setSimulatedGeoCountry: (countryCode: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('samplegoldmine_geo_country', countryCode);
    window.dispatchEvent(new Event('geo-country-change'));
  },
  toggleUserVerification: async (userId: string): Promise<MockUser[]> => {
    const currentUsers = await adminService.getGlobalUsers();
    const targetUser = currentUsers.find(u => u.id === userId);
    const newStatus = targetUser ? !targetUser.isVerified : true;

    if (isRealSupabaseConfigured && supabase) {
      await supabase
        .from('users')
        .update({ is_verified: newStatus })
        .eq('id', userId);
      return adminService.getGlobalUsers();
    }

    const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
    const updated = users.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          isVerified: newStatus 
        };
      }
      return u;
    });
    setLocalData(STORAGE_KEYS.USERS, updated);
    return updated.map(u => ({
      ...u,
      isVerified: u.isVerified !== undefined ? u.isVerified : u.role === 'Seller',
      isSuspended: u.isSuspended !== undefined ? u.isSuspended : false
    }));
  },
  toggleUserSuspension: async (userId: string): Promise<MockUser[]> => {
    const currentUsers = await adminService.getGlobalUsers();
    const targetUser = currentUsers.find(u => u.id === userId);
    const newStatus = targetUser ? !targetUser.isSuspended : true;

    if (isRealSupabaseConfigured && supabase) {
      await supabase
        .from('users')
        .update({ is_suspended: newStatus })
        .eq('id', userId);
      return adminService.getGlobalUsers();
    }

    const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
    const updated = users.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          isSuspended: newStatus 
        };
      }
      return u;
    });
    setLocalData(STORAGE_KEYS.USERS, updated);
    return updated.map(u => ({
      ...u,
      isVerified: u.isVerified !== undefined ? u.isVerified : u.role === 'Seller',
      isSuspended: u.isSuspended !== undefined ? u.isSuspended : false
    }));
  },
  deleteAnyAsset: async (id: string, type: string): Promise<void> => {
    if (isRealSupabaseConfigured && supabase) {
      await supabase
        .from('products')
        .delete()
        .eq('id', id);
      return;
    }
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filtered = products.filter(p => p.id !== id);
    setLocalData(STORAGE_KEYS.PRODUCTS, filtered);
  },
  getGeoAnalytics: () => {
    return [
      { country: 'United States', code: 'US', downloads: 8150, percentage: 48, revenue: 14040.72 },
      { country: 'United Kingdom', code: 'GB', downloads: 4250, percentage: 25, revenue: 7312.87 },
      { country: 'Germany', code: 'DE', downloads: 2890, percentage: 17, revenue: 4972.76 },
      { country: 'Canada', code: 'CA', downloads: 1700, percentage: 10, revenue: 2925.15 }
    ];
  }
};

// 7. Discussion and Comment Services
export interface MockComment {
  id: string;
  sample_id: string;
  username: string;
  avatarLetter: string;
  profilePictureUrl?: string;
  text: string;
  timestamp: string;
  likes: number;
  likedByCurrentUser: boolean;
}

const commentDatabase: Record<string, MockComment[]> = {};

export const commentService = {
  getCommentsForSample: async (sampleId: string): Promise<MockComment[]> => {
    if (isRealSupabaseConfigured && supabase && isUuid(sampleId)) {
      const session = authService.getCurrentUser();
      const currentUserId = session?.id;

      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            sample_id,
            text,
            created_at,
            user_id,
            users!comments_user_id_fkey (
              username,
              profile_picture_url
            ),
            comment_likes (
              user_id
            )
          `)
          .eq('sample_id', sampleId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch comments from Supabase:', error);
          return [];
        }

        return (data || []).map((c: any) => {
          const author = c.users ? (Array.isArray(c.users) ? c.users[0] : c.users) : null;
          const authorUsername = author?.username || 'User';
          const authorProfilePic = author?.profile_picture_url || '';
          const likesList = c.comment_likes || [];
          const likesCount = likesList.length;
          const likedByCurrentUser = currentUserId ? likesList.some((l: any) => l.user_id === currentUserId) : false;

          return {
            id: c.id,
            sample_id: c.sample_id,
            username: authorUsername,
            avatarLetter: authorUsername.charAt(0).toUpperCase(),
            profilePictureUrl: authorProfilePic,
            text: c.text,
            timestamp: new Date(c.created_at).toLocaleDateString() + ' ' + new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            likes: likesCount,
            likedByCurrentUser
          };
        });
      } catch (err) {
        console.error('Error in getCommentsForSample:', err);
        return [];
      }
    }

    // Mock fallback
    if (!commentDatabase[sampleId]) {
      const users = getLocalData<User[]>(STORAGE_KEYS.USERS, []);
      const chillUser = users.find(u => u.username === "ChillWave");
      const forgeUser = users.find(u => u.username === "SoundForge");
      commentDatabase[sampleId] = [
        {
          id: `cmt-${sampleId}-1`,
          sample_id: sampleId,
          username: "ChillWave",
          avatarLetter: "C",
          profilePictureUrl: chillUser?.profile_picture_url || '',
          text: "Love this sound! Clean mix and great rhythm.",
          timestamp: "2 hours ago",
          likes: 3,
          likedByCurrentUser: false
        },
        {
          id: `cmt-${sampleId}-2`,
          sample_id: sampleId,
          username: "SoundForge",
          avatarLetter: "S",
          profilePictureUrl: forgeUser?.profile_picture_url || '',
          text: "Transients are really crisp. Nice compression.",
          timestamp: "1 day ago",
          likes: 5,
          likedByCurrentUser: false
        }
      ];
    }
    return commentDatabase[sampleId];
  },
  addComment: async (sampleId: string, text: string): Promise<MockComment | null> => {
    const user = authService.getCurrentUser();
    if (!user) return null;

    if (isRealSupabaseConfigured && supabase && isUuid(sampleId)) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .insert({
            sample_id: sampleId,
            user_id: user.id,
            text
          })
          .select(`
            id,
            sample_id,
            text,
            created_at,
            users!comments_user_id_fkey (
              username,
              profile_picture_url
            )
          `)
          .single();

        if (error) {
          console.error('Failed to post comment to Supabase:', error);
          return null;
        }

        const author = (data as any).users ? (Array.isArray((data as any).users) ? (data as any).users[0] : (data as any).users) : null;
        const authorUsername = author?.username || user.username;
        const authorProfilePic = author?.profile_picture_url || '';
        return {
          id: data.id,
          sample_id: data.sample_id,
          username: authorUsername,
          avatarLetter: authorUsername.charAt(0).toUpperCase(),
          profilePictureUrl: authorProfilePic,
          text: data.text,
          timestamp: 'Just now',
          likes: 0,
          likedByCurrentUser: false
        };
      } catch (err) {
        console.error('Error in addComment:', err);
        return null;
      }
    }

    // Mock fallback
    const newComment: MockComment = {
      id: `cmt-${Date.now()}`,
      sample_id: sampleId,
      username: user.username,
      avatarLetter: user.username.charAt(0).toUpperCase(),
      profilePictureUrl: user.profile_picture_url || '',
      text,
      timestamp: "Just now",
      likes: 0,
      likedByCurrentUser: false
    };
    
    if (!commentDatabase[sampleId]) {
      commentDatabase[sampleId] = [];
    }
    commentDatabase[sampleId].unshift(newComment);
    return newComment;
  },
  likeComment: async (commentId: string): Promise<boolean> => {
    const user = authService.getCurrentUser();
    if (!user) return false;

    if (isRealSupabaseConfigured && supabase && isUuid(commentId)) {
      try {
        const { data, error } = await supabase
          .from('comment_likes')
          .select('*')
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Failed to check comment likes in Supabase:', error);
          return false;
        }

        const isLiked = data && data.length > 0;
        if (isLiked) {
          const { error: delError } = await supabase
            .from('comment_likes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);
          if (delError) {
            console.error('Failed to remove comment like:', delError);
            return true; // assume still liked if delete failed
          }
          return false;
        } else {
          const { error: insError } = await supabase
            .from('comment_likes')
            .insert({ comment_id: commentId, user_id: user.id });
          if (insError) {
            console.error('Failed to save comment like:', insError);
            return false;
          }
          return true;
        }
      } catch (err) {
        console.error('Error in likeComment:', err);
        return false;
      }
    }

    // Mock fallback
    for (const sampleId in commentDatabase) {
      const comment = commentDatabase[sampleId].find(c => c.id === commentId);
      if (comment) {
        if (comment.likedByCurrentUser) {
          comment.likes -= 1;
          comment.likedByCurrentUser = false;
        } else {
          comment.likes += 1;
          comment.likedByCurrentUser = true;
        }
        return comment.likedByCurrentUser;
      }
    }
    return false;
  }
};
