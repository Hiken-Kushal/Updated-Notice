import { prisma } from '../config/prisma';
import { EmailService } from './email.service';

export class SubscriptionService {
  static async subscribe(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.isActive) {
        // Already active subscription → do not send another email
        return { message: "You're already subscribed to ICEM Notice alerts." };
      }

      // Reactivated subscription → update DB → send confirmation email
      await prisma.newsletterSubscription.update({
        where: { id: existing.id },
        data: { isActive: true },
      });

      try {
        await EmailService.sendSubscriptionConfirmation(normalizedEmail);
      } catch (err: any) {
        console.error(
          `[SubscriptionService] Non-fatal error sending confirmation email to ${normalizedEmail}:`,
          err?.message || err
        );
      }

      return { message: "Successfully subscribed! You'll receive official college circulars." };
    }

    // New subscription → save to DB → send confirmation email
    await prisma.newsletterSubscription.create({
      data: { email: normalizedEmail },
    });

    try {
      await EmailService.sendSubscriptionConfirmation(normalizedEmail);
    } catch (err: any) {
      console.error(
        `[SubscriptionService] Non-fatal error sending confirmation email to ${normalizedEmail}:`,
        err?.message || err
      );
    }

    return { message: "Successfully subscribed! You'll receive official college circulars." };
  }
}

