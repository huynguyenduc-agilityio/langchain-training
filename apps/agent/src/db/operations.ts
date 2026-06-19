import { eq, desc, like } from 'drizzle-orm';

import { db } from './index';
import { trips, drivers, users } from './schema';
import { Trip, Driver, TripStatus, VehicleType } from '@/types';
import { COORDINATES } from '@/constants';
import { sanitizePhone } from '@/utils';

/**
 * Fetch a trip from the database and resolve driver info if present.
 */
export async function getTripFromDb(tripId: string): Promise<Trip | undefined> {
  try {
    const result = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);
    if (result.length === 0) return undefined;

    const row = result[0];
    let driver: Driver | undefined = undefined;

    if (row.driverId) {
      const driverResult = await db
        .select()
        .from(drivers)
        .where(eq(drivers.id, row.driverId))
        .limit(1);
      if (driverResult.length > 0) {
        const dRow = driverResult[0];
        driver = {
          name: dRow.name,
          phone: dRow.phone,
          vehicleInfo: dRow.vehicleInfo,
          licensePlate: dRow.licensePlate,
          rating: dRow.rating || 5.0,
        };
      }
    }

    return {
      id: row.id,
      userId: row.userId,
      pickup: row.pickup,
      destination: row.destination,
      distance: row.distance,
      duration: row.duration,
      vehicleType: row.vehicleType as VehicleType,
      passengerName: row.passengerName,
      passengerPhone: row.passengerPhone,
      price: row.price,
      status: (row.status as TripStatus) || 'searching',
      createdAt: row.createdAt
        ? row.createdAt.toISOString()
        : new Date().toISOString(),
      cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : undefined,
      cancellationFee: row.cancellationFee || undefined,
      driver,
    };
  } catch (error) {
    console.error('[DB] Error getting trip:', error);
    return undefined;
  }
}

/**
 * Retrieve trips filtered by user ID from the database.
 * @param limit - Maximum number of trips to return (default: 5 most recent)
 */
export async function getTripsByUserIdFromDb(
  userId: string,
  limit = 5,
): Promise<Trip[]> {
  try {
    const result = await db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(desc(trips.createdAt))
      .limit(limit);

    const resultTrips: Trip[] = [];

    for (const row of result) {
      let driver: Driver | undefined = undefined;
      if (row.driverId) {
        const dRes = await db
          .select()
          .from(drivers)
          .where(eq(drivers.id, row.driverId))
          .limit(1);
        if (dRes.length > 0) {
          driver = {
            name: dRes[0].name,
            phone: dRes[0].phone,
            vehicleInfo: dRes[0].vehicleInfo,
            licensePlate: dRes[0].licensePlate,
            rating: dRes[0].rating || 5.0,
          };
        }
      }

      resultTrips.push({
        id: row.id,
        userId: row.userId,
        pickup: row.pickup,
        destination: row.destination,
        distance: row.distance,
        duration: row.duration,
        vehicleType: row.vehicleType as VehicleType,
        passengerName: row.passengerName,
        passengerPhone: row.passengerPhone,
        price: row.price,
        status: (row.status as TripStatus) || 'searching',
        createdAt: row.createdAt
          ? row.createdAt.toISOString()
          : new Date().toISOString(),
        cancelledAt: row.cancelledAt
          ? row.cancelledAt.toISOString()
          : undefined,
        cancellationFee: row.cancellationFee || undefined,
        driver,
      });
    }

    return resultTrips;
  } catch (error) {
    console.error('[DB] Error getting trips by userId:', error);
    return [];
  }
}

/**
 * Retrieve trips filtered by phone from the database.
 * @param limit - Maximum number of trips to return (default: 5 most recent)
 */
export async function getTripsByPhoneFromDb(
  phone: string,
  limit = 5,
): Promise<Trip[]> {
  try {
    const cleanPhone = sanitizePhone(phone);
    // Use a DB-level filter instead of full-table scan in memory
    const matching = await db
      .select()
      .from(trips)
      .where(like(trips.passengerPhone, `%${cleanPhone}%`))
      .orderBy(desc(trips.createdAt))
      .limit(limit);

    const resultTrips: Trip[] = [];

    for (const row of matching) {
      let driver: Driver | undefined = undefined;
      if (row.driverId) {
        const dRes = await db
          .select()
          .from(drivers)
          .where(eq(drivers.id, row.driverId))
          .limit(1);
        if (dRes.length > 0) {
          driver = {
            name: dRes[0].name,
            phone: dRes[0].phone,
            vehicleInfo: dRes[0].vehicleInfo,
            licensePlate: dRes[0].licensePlate,
            rating: dRes[0].rating || 5.0,
          };
        }
      }

      resultTrips.push({
        id: row.id,
        userId: row.userId,
        pickup: row.pickup,
        destination: row.destination,
        distance: row.distance,
        duration: row.duration,
        vehicleType: row.vehicleType as VehicleType,
        passengerName: row.passengerName,
        passengerPhone: row.passengerPhone,
        price: row.price,
        status: (row.status as TripStatus) || 'searching',
        createdAt: row.createdAt
          ? row.createdAt.toISOString()
          : new Date().toISOString(),
        cancelledAt: row.cancelledAt
          ? row.cancelledAt.toISOString()
          : undefined,
        cancellationFee: row.cancellationFee || undefined,
        driver,
      });
    }

    return resultTrips;
  } catch (error) {
    console.error('[DB] Error getting trips by phone:', error);
    return [];
  }
}

export async function addTripToDb(
  trip: Trip,
  userName?: string,
  userEmail?: string,
): Promise<void> {
  try {
    const targetUserId = trip.userId;

    // Upsert the user first with real auth profile to avoid foreign key violations
    await db
      .insert(users)
      .values({
        id: targetUserId,
        name: userName || null,
        email: userEmail || null,
      })
      .onConflictDoNothing();

    await db.insert(trips).values({
      id: trip.id,
      userId: targetUserId,
      pickup: trip.pickup,
      pickupLat: trip.pickupLat || COORDINATES.DEFAULT_CITY.latitude,
      pickupLng: trip.pickupLng || COORDINATES.DEFAULT_CITY.longitude,
      destination: trip.destination,
      destLat: trip.destLat || COORDINATES.MOCK_DESTINATION.latitude,
      destLng: trip.destLng || COORDINATES.MOCK_DESTINATION.longitude,
      distance: trip.distance,
      duration: trip.duration,
      price: trip.price,
      vehicleType: trip.vehicleType,
      passengerName: trip.passengerName,
      passengerPhone: trip.passengerPhone,
      status: trip.status,
    });
  } catch (error) {
    console.error('[DB] Error adding trip:', error);
  }
}

/**
 * Update trip record in the database.
 */
export async function updateTripInDb(
  tripId: string,
  updates: Partial<Trip>,
): Promise<Trip | undefined> {
  try {
    const updateData: Partial<typeof trips.$inferInsert> = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.cancellationFee !== undefined)
      updateData.cancellationFee = updates.cancellationFee;
    if (updates.cancelledAt)
      updateData.cancelledAt = new Date(updates.cancelledAt);

    if (updates.driver) {
      const dRes = await db
        .select()
        .from(drivers)
        .where(eq(drivers.phone, updates.driver.phone))
        .limit(1);
      if (dRes.length > 0) {
        updateData.driverId = dRes[0].id;
      }
    }

    // Fetch the existing trip to know the driverId before we change anything
    let oldDriverId: string | null = null;
    if (updates.status === 'cancelled' || updates.status === 'completed') {
      const existing = await db
        .select()
        .from(trips)
        .where(eq(trips.id, tripId))
        .limit(1);
      if (existing.length > 0) {
        oldDriverId = existing[0].driverId;
      }
    }

    await db.update(trips).set(updateData).where(eq(trips.id, tripId));

    // If the trip is completed or cancelled, release the driver to be available again
    if (oldDriverId) {
      await db
        .update(drivers)
        .set({ isAvailable: true })
        .where(eq(drivers.id, oldDriverId));
    }

    return getTripFromDb(tripId);
  } catch (error) {
    console.error('[DB] Error updating trip:', error);
    return undefined;
  }
}
