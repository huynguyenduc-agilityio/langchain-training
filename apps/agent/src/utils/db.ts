import { db } from '../db/index';
import { trips, drivers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Trip, Driver } from '../state/state';

// Standard drivers list
export const MOCK_DRIVERS: Driver[] = [
  {
    name: 'Nguyen Van A',
    phone: '+84905123456',
    vehicleInfo: 'Honda Vision (Black)',
    licensePlate: '43A-999.99',
    rating: 4.9,
  },
  {
    name: 'Tran Van B',
    phone: '+84905987654',
    vehicleInfo: 'Toyota Vios (Silver)',
    licensePlate: '43B-777.77',
    rating: 4.8,
  },
  {
    name: 'Le Van C',
    phone: '+84905555555',
    vehicleInfo: 'Mitsubishi Xpander (White)',
    licensePlate: '43C-888.88',
    rating: 5.0,
  },
];

/**
 * Seed drivers in the PostgreSQL database if the table is empty.
 */
export async function seedDriversIfNeeded() {
  try {
    const existing = await db.select().from(drivers).limit(1);
    if (existing.length === 0) {
      console.log('[DB] Seeding standard drivers in Da Nang...');
      await db.insert(drivers).values([
        {
          id: 'DRV-001',
          name: 'Nguyen Van A',
          phone: '+84905123456',
          vehicleInfo: 'Honda Vision (Black)',
          licensePlate: '43A-999.99',
          rating: 4.9,
          latitude: 16.0544,
          longitude: 108.2022,
          isAvailable: 'true',
        },
        {
          id: 'DRV-002',
          name: 'Tran Van B',
          phone: '+84905987654',
          vehicleInfo: 'Toyota Vios (Silver)',
          licensePlate: '43B-777.77',
          rating: 4.8,
          latitude: 16.0782,
          longitude: 108.2123,
          isAvailable: 'true',
        },
        {
          id: 'DRV-003',
          name: 'Le Van C',
          phone: '+84905555555',
          vehicleInfo: 'Mitsubishi Xpander (White)',
          licensePlate: '43C-888.88',
          rating: 5.0,
          latitude: 16.0464,
          longitude: 108.2208,
          isAvailable: 'true',
        },
      ]);
    }
  } catch (error) {
    console.error('[DB] Error seeding drivers:', error);
  }
}

/**
 * Fetch a trip from the database and resolve driver info if present.
 */
export async function getTripFromDb(tripId: string): Promise<Trip | undefined> {
  try {
    const result = await db.select().from(trips).where(eq(trips.id as any, tripId as any) as any).limit(1);
    if (result.length === 0) return undefined;

    const row = result[0];
    let driver: Driver | undefined = undefined;

    if (row.driverId) {
      const driverResult = await db.select().from(drivers).where(eq(drivers.id as any, row.driverId as any) as any).limit(1);
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
      pickup: row.pickup,
      destination: row.destination,
      distance: row.distance,
      duration: row.duration,
      vehicleType: row.vehicleType as any,
      passengerName: row.passengerName,
      passengerPhone: row.passengerPhone,
      price: row.price,
      status: row.status as any,
      createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
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
 * Retrieve all trips filtered by phone from the database.
 */
export async function getTripsByPhoneFromDb(phone: string): Promise<Trip[]> {
  try {
    const cleanPhone = phone.replace(/[\s-()]/g, '');
    const allTrips = await db.select().from(trips);
    const matching = allTrips.filter(
      (t) => t.passengerPhone.replace(/[\s-()]/g, '') === cleanPhone
    );

    const resultTrips: Trip[] = [];

    for (const row of matching) {
      let driver: Driver | undefined = undefined;
      if (row.driverId) {
        const dRes = await db.select().from(drivers).where(eq(drivers.id as any, row.driverId as any) as any).limit(1);
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
        pickup: row.pickup,
        destination: row.destination,
        distance: row.distance,
        duration: row.duration,
        vehicleType: row.vehicleType as any,
        passengerName: row.passengerName,
        passengerPhone: row.passengerPhone,
        price: row.price,
        status: row.status as any,
        createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
        cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : undefined,
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

/**
 * Add a new trip record to the database.
 */
export async function addTripToDb(trip: Trip): Promise<void> {
  try {
    await seedDriversIfNeeded();

    await db.insert(trips).values({
      id: trip.id,
      pickup: trip.pickup,
      pickupLat: 16.0544, // Default Da Nang center latitude
      pickupLng: 108.2022, // Default Da Nang center longitude
      destination: trip.destination,
      destLat: 16.0782,
      destLng: 108.2123,
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
  updates: Partial<Trip>
): Promise<Trip | undefined> {
  try {
    const updateData: any = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.cancellationFee !== undefined) updateData.cancellationFee = updates.cancellationFee;
    if (updates.cancelledAt) updateData.cancelledAt = new Date(updates.cancelledAt);

    if (updates.driver) {
      const dRes = await db.select().from(drivers).where(eq(drivers.phone as any, updates.driver.phone as any) as any).limit(1);
      if (dRes.length > 0) {
        updateData.driverId = dRes[0].id;
      }
    }

    await db.update(trips).set(updateData).where(eq(trips.id as any, tripId as any) as any);
    return getTripFromDb(tripId);
  } catch (error) {
    console.error('[DB] Error updating trip:', error);
    return undefined;
  }
}
