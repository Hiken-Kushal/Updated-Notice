import { prisma } from '../config/prisma';

export class SubscriptionService {
  static async subscribe(email: string) {
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscription.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      return { message: "You're already subscribed to ICEM Notice alerts." };
    }

    await prisma.newsletterSubscription.create({
      data: { email: email.toLowerCase().trim() },
    });

    return { message: "Successfully subscribed! You'll receive official college circulars." };
  }
}
