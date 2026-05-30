import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import { Messaging } from "firebase-admin/messaging";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf-8"),
) as ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminMessaging: Messaging = admin.messaging();
