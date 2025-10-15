"use client";

import { db, type UserProfile, type UserSettings } from "@/lib/database";

export const DEMO_PROFILE_KEY = "bb_demo_profile";
export const DEMO_SETTINGS_KEY = "bb_demo_settings";
export const DEMO_LOGIN_KEY = "bb_demo_logged_in";
export const DEMO_USER_EVENT = "bb-demo-user-change";

export type DemoProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string;
};

export type DemoSettings = {
  emailUpdates: boolean;
  smsUpdates: boolean;
  marketingTips: boolean;
  darkMode: "light" | "dark" | "system";
};

export const defaultDemoProfile: DemoProfile = {
  name: "Rina Kusuma",
  email: "rina.kusuma@gmail.com",
  phone: "0821-4567-8901",
  address: "Jl. Ahmad Yani No. 45, Semarang",
  memberSince: "12 Januari 2024",
};

export const defaultDemoSettings: DemoSettings = {
  emailUpdates: true,
  smsUpdates: false,
  marketingTips: true,
  darkMode: "system",
};

const emitChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DEMO_USER_EVENT));
  }
};

const resolveCurrentRole = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const stored = window.localStorage.getItem("user");
    if (!stored) {
      return undefined;
    }
    const parsed = JSON.parse(stored) as { role?: string };
    if (parsed.role === "admin" || parsed.role === "user") {
      return parsed.role;
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
};

const syncProfileToDatabase = (profile: DemoProfile, previousEmail?: string) => {
  if (typeof window === "undefined" || !db?.profiles) {
    return;
  }

  const task = async () => {
    const lookupEmail = previousEmail ?? profile.email;
    const lookupLower = lookupEmail.toLowerCase();
    const emailLower = profile.email.toLowerCase();
    const now = new Date();
    const role = resolveCurrentRole();

    const existing = await db.profiles
      .where("emailLower")
      .equals(lookupLower)
      .first();

    if (existing) {
      await db.profiles.update(existing.id!, {
        email: profile.email,
        emailLower,
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        memberSince: profile.memberSince,
        role: role ?? existing.role,
        updatedAt: now,
      } as Partial<UserProfile>);
    } else {
      await db.profiles.add({
        email: profile.email,
        emailLower,
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        memberSince: profile.memberSince,
        role,
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  void task();
};

const syncSettingsToDatabase = (
  settings: DemoSettings,
  email?: string,
  previousEmail?: string
) => {
  if (typeof window === "undefined" || !db?.settings) {
    return;
  }

  const task = async () => {
    const currentProfile = loadDemoProfile();
    const profileEmail = email ?? currentProfile.email;
    const lookupEmail = previousEmail ?? profileEmail;
    const emailLower = profileEmail.toLowerCase();
    const lookupLower = lookupEmail.toLowerCase();
    const now = new Date();

    const existing = await db.settings
      .where("emailLower")
      .equals(lookupLower)
      .first();

    if (existing) {
      await db.settings.update(existing.id!, {
        email: profileEmail,
        emailLower,
        emailUpdates: settings.emailUpdates,
        smsUpdates: settings.smsUpdates,
        marketingTips: settings.marketingTips,
        darkMode: settings.darkMode,
        updatedAt: now,
      } as Partial<UserSettings>);
    } else {
      await db.settings.add({
        email: profileEmail,
        emailLower,
        emailUpdates: settings.emailUpdates,
        smsUpdates: settings.smsUpdates,
        marketingTips: settings.marketingTips,
        darkMode: settings.darkMode,
        updatedAt: now,
      });
    }
  };

  void task();
};

const deleteProfileFromDatabase = (email: string) => {
  if (typeof window === "undefined" || !db?.profiles) {
    return;
  }

  const task = async () => {
    const emailLower = email.toLowerCase();
    const existing = await db.profiles
      .where("emailLower")
      .equals(emailLower)
      .first();
    if (existing?.id != null) {
      await db.profiles.delete(existing.id);
    }
  };

  void task();
};

const deleteSettingsFromDatabase = (email: string) => {
  if (typeof window === "undefined" || !db?.settings) {
    return;
  }

  const task = async () => {
    const emailLower = email.toLowerCase();
    const existing = await db.settings
      .where("emailLower")
      .equals(emailLower)
      .first();
    if (existing?.id != null) {
      await db.settings.delete(existing.id);
    }
  };

  void task();
};

export const loadDemoProfile = (): DemoProfile => {
  if (typeof window === "undefined") {
    return defaultDemoProfile;
  }

  const stored = window.localStorage.getItem(DEMO_PROFILE_KEY);
  if (!stored) {
    return defaultDemoProfile;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<DemoProfile>;
    return {
      ...defaultDemoProfile,
      ...parsed,
    };
  } catch {
    return defaultDemoProfile;
  }
};

export const saveDemoProfile = (profile: DemoProfile) => {
  if (typeof window === "undefined") {
    return;
  }

  const previous = loadDemoProfile();
  window.localStorage.setItem(
    DEMO_PROFILE_KEY,
    JSON.stringify(profile)
  );
  syncProfileToDatabase(profile, previous.email);
  emitChange();
};

export const clearDemoProfile = () => {
  if (typeof window === "undefined") {
    return;
  }
  const current = loadDemoProfile();
  window.localStorage.removeItem(DEMO_PROFILE_KEY);
  deleteProfileFromDatabase(current.email);
  emitChange();
};

export const loadDemoSettings = (): DemoSettings => {
  if (typeof window === "undefined") {
    return defaultDemoSettings;
  }

  const stored = window.localStorage.getItem(DEMO_SETTINGS_KEY);
  if (!stored) {
    return defaultDemoSettings;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<DemoSettings>;
    return {
      ...defaultDemoSettings,
      ...parsed,
    };
  } catch {
    return defaultDemoSettings;
  }
};

export const saveDemoSettings = (settings: DemoSettings) => {
  if (typeof window === "undefined") {
    return;
  }

  const currentProfile = loadDemoProfile();
  window.localStorage.setItem(
    DEMO_SETTINGS_KEY,
    JSON.stringify(settings)
  );
  syncSettingsToDatabase(settings, currentProfile.email, currentProfile.email);
  emitChange();
};

export const clearDemoSettings = () => {
  if (typeof window === "undefined") {
    return;
  }
  const current = loadDemoProfile();
  window.localStorage.removeItem(DEMO_SETTINGS_KEY);
  deleteSettingsFromDatabase(current.email);
  emitChange();
};

export const isDemoUserLoggedIn = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }
  const value = window.localStorage.getItem(DEMO_LOGIN_KEY);
  return value !== "false";
};

export const setDemoUserLoggedIn = (value: boolean) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(DEMO_LOGIN_KEY, value ? "true" : "false");
  emitChange();
};

export const clearDemoUserState = () => {
  clearDemoProfile();
  clearDemoSettings();
  setDemoUserLoggedIn(false);
};
