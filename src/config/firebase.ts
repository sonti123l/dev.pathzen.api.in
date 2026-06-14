import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import { Messaging } from "firebase-admin/messaging";
import "dotenv/config";

const serviceAccount = JSON.parse(
  process.env.SERVICE_KEY_VALUE!,
) as ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminMessaging: Messaging = admin.messaging();
