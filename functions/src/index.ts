import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { CallableContext } from "firebase-functions/v1/https";

// Initialize admin SDK
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();
const adminAuth = admin.auth();

// Initialize Stripe
const stripeSecretKey = functions.config().stripe?.secret || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-09-30.clover",
});

// Define types for our callable functions
interface SetUserRoleData {
  uid: string;
  role: string;
}

interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  caId: string;
  serviceId: string;
  serviceName?: string;
}

interface GenerateDocumentUrlData {
  documentId: string;
}

/**
 * Set user role custom claim
 */
export const setUserRole = functions.https.onCall(async (data: SetUserRoleData, context: CallableContext) => {
  // Check if request is made by an authenticated user
  if (!context?.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { uid, role } = data;

  // Check if the user is modifying their own account or is an admin
  if (context.auth.uid !== uid) {
    // Check if the user is an admin
    const requestingUserRecord = await adminAuth.getUser(context.auth.uid);
    const customClaims = requestingUserRecord.customClaims || {};
    
    if (!customClaims.admin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You don't have permission to modify other user roles."
      );
    }
  }

  // Validate role
  const validRoles = ["customer", "ca", "business"];
  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Role must be one of: customer, ca, or business"
    );
  }

  try {
    // Set custom claim
    await adminAuth.setCustomUserClaims(uid, { role });
    return { success: true };
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error setting user role."
    );
  }
});

/**
 * Create a payment intent for consultations and services
 */
export const createPaymentIntent = functions.https.onCall(
  async (data: CreatePaymentIntentData, context: CallableContext) => {
    // Check if request is made by an authenticated user
    if (!context?.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const { amount, currency, caId, serviceId, serviceName } = data;

    if (!amount || !currency || !caId || !serviceId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters."
      );
    }

    try {
      // Get CA user's Stripe account ID
      const caDoc = await db.collection("userProfiles").doc(caId).get();
      const caData = caDoc.data();

      if (!caData || !caData.stripeConnectAccountId) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "CA does not have a Stripe account set up."
        );
      }

      // Calculate platform fee (10% for example)
      const platformFee = Math.round(amount * 0.1);

      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        application_fee_amount: platformFee,
        transfer_data: {
          destination: caData.stripeConnectAccountId,
        },
        metadata: {
          customerId: context.auth.uid,
          caId,
          serviceId,
          serviceName: serviceName || "Consultation",
        },
      });

      // Create a record in Firestore
      await db.collection("payments").add({
        paymentIntentId: paymentIntent.id,
        customerId: context.auth.uid,
        caId,
        serviceId,
        serviceName: serviceName || "Consultation",
        amount,
        currency,
        platformFee,
        status: "created",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error creating payment."
      );
    }
  }
);

/**
 * Listen for new user creation and set up initial data
 */
export const onUserCreate = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  try {
    // Create a user profile document if it doesn't exist
    const userProfileRef = db.collection("userProfiles").doc(user.uid);
    const snapshot = await userProfileRef.get();

    if (!snapshot.exists) {
      // Create default profile
      await userProfileRef.set({
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        onboardingCompleted: false,
      });
    }

    return null;
  } catch (error) {
    console.error("Error in onUserCreate function:", error);
    return null;
  }
});

/**
 * Schedule recurring payments for retainer agreements
 * This would be triggered by a Pub/Sub scheduler daily
 */
export const processRecurringPayments = functions.pubsub
  .schedule("0 0 * * *") // Run daily at midnight
  .onRun(async (context: functions.EventContext) => {
    const now = admin.firestore.Timestamp.now();

    try {
      // Get all retainer agreements that need billing today
      const retainerSnapshot = await db
        .collection("retainerAgreements")
        .where("nextBillingDate", "<=", now)
        .where("status", "==", "active")
        .get();

      const batch = db.batch();
      const promises: Promise<any>[] = [];

      retainerSnapshot.forEach((doc) => {
        const retainer = doc.data();
        // docIndex is needed in the second forEach loop but not here

        // Create Stripe payment
        const paymentPromise = stripe.paymentIntents.create({
          amount: retainer.amount,
          currency: retainer.currency,
          customer: retainer.stripeCustomerId,
          payment_method: retainer.stripePaymentMethodId,
          off_session: true,
          confirm: true,
          application_fee_amount: Math.round(retainer.amount * 0.1),
          transfer_data: {
            destination: retainer.caStripeAccountId,
          },
          metadata: {
            retainerAgreementId: doc.id,
            customerId: retainer.customerId,
            caId: retainer.caId,
          },
        });

        // Update next billing date
        const retainerRef = db.collection("retainerAgreements").doc(doc.id);
        batch.update(retainerRef, {
          nextBillingDate: admin.firestore.Timestamp.fromMillis(
            retainer.nextBillingDate.toMillis() + 30 * 24 * 60 * 60 * 1000
          ),
          lastBillingDate: now,
        });

        promises.push(paymentPromise);
      });

      // Execute all payment creations
      const paymentResults = await Promise.allSettled(promises);

      // Create payment records
      retainerSnapshot.forEach((doc) => {
        const docIndex = retainerSnapshot.docs.indexOf(doc);
        const paymentResult = paymentResults[docIndex];
        const retainer = doc.data();

        if (paymentResult.status === "fulfilled") {
          const paymentIntent = paymentResult.value;
          const paymentRef = db.collection("payments").doc();

          batch.set(paymentRef, {
            paymentIntentId: paymentIntent.id,
            customerId: retainer.customerId,
            caId: retainer.caId,
            retainerAgreementId: doc.id,
            amount: retainer.amount,
            currency: retainer.currency,
            status: paymentIntent.status,
            platformFee: Math.round(retainer.amount * 0.1),
            createdAt: now,
            type: "recurring",
          });
        } else {
          console.error(
            `Failed to process payment for retainer ${doc.id}:`,
            paymentResult.reason
          );

          // Log failed payment
          const failedPaymentRef = db.collection("failedPayments").doc();
          batch.set(failedPaymentRef, {
            retainerAgreementId: doc.id,
            customerId: retainer.customerId,
            caId: retainer.caId,
            amount: retainer.amount,
            currency: retainer.currency,
            error: paymentResult.reason.message,
            createdAt: now,
          });
        }
      });

      // Commit batch updates
      await batch.commit();

      return null;
    } catch (error) {
      console.error("Error in processRecurringPayments function:", error);
      return null;
    }
  });

/**
 * Generate a secure document download URL
 */
export const generateDocumentUrl = functions.https.onCall(
  async (data: GenerateDocumentUrlData, context: CallableContext) => {
    // Check if request is made by an authenticated user
    if (!context?.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const { documentId } = data;

    if (!documentId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Document ID is required."
      );
    }

    try {
      // Get document metadata
      const docRef = db.collection("documents").doc(documentId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Document not found."
        );
      }

      const docData = doc.data();

      // Check permissions
      if (
        docData?.customerId !== context?.auth?.uid &&
        docData?.caId !== context?.auth?.uid
      ) {
        // Check if user is part of the business that owns this document
        let hasAccess = false;
        
        if (docData?.businessId && context?.auth?.uid) {
          const businessMembershipRef = db
            .collection("businessMembers")
            .where("businessId", "==", docData.businessId)
            .where("userId", "==", context.auth.uid)
            .limit(1);
          
          const membershipSnapshot = await businessMembershipRef.get();
          hasAccess = !membershipSnapshot.empty;
        }
        
        if (!hasAccess) {
          throw new functions.https.HttpsError(
            "permission-denied",
            "You don't have permission to access this document."
          );
        }
      }

      // Generate a signed URL (valid for 15 minutes)
      const bucket = admin.storage().bucket();
      const file = bucket.file(docData?.storagePath);
      
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      // Log access
      await docRef.collection("accessLogs").add({
        userId: context?.auth?.uid || "unknown",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userAgent: context?.rawRequest?.headers?.["user-agent"] || "Unknown",
      });

      return { url };
    } catch (error) {
      console.error("Error generating document URL:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error generating document URL."
      );
    }
  }
);