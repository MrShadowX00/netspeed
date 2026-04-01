import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyApOR81fTczF-cyTs6q9Jb7C-_qcJq_7GU",
  authDomain: "toollo-org.firebaseapp.com",
  projectId: "toollo-org",
  storageBucket: "toollo-org.firebasestorage.app",
  messagingSenderId: "665548341893",
  appId: "1:665548341893:web:f9865c9cfb5427f6af9fec",
  measurementId: "G-M0C81BK6VM",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let analytics: Analytics | null = null;

export async function initAnalytics(): Promise<void> {
  if (typeof window === "undefined" || analytics) return;
  const supported = await isSupported();
  if (supported) {
    analytics = getAnalytics(app);
  }
}

export async function trackPageView(path: string): Promise<void> {
  if (!analytics) await initAnalytics();
  if (analytics) {
    logEvent(analytics, "page_view", { page_path: path });
  }
}

export async function trackEvent(name: string, params?: Record<string, string | number>): Promise<void> {
  if (!analytics) await initAnalytics();
  if (analytics) {
    logEvent(analytics, name, params);
  }
}
