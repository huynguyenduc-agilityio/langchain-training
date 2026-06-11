import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import type { Trip, Driver } from '@/types';

// GET: Retrieve all trips from database, sorted by newest first
export async function GET() {
  try {
    const allTrips = await db.select().from(schema.trips).orderBy(desc(schema.trips.createdAt));
    const resultTrips: Trip[] = [];

    for (const row of allTrips) {
      let driver: Driver | undefined = undefined;
      if (row.driverId) {
        const dRes = await db.select().from(schema.drivers).where(eq(schema.drivers.id, row.driverId)).limit(1);
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

    return NextResponse.json({ success: true, trips: resultTrips });
  } catch (error: any) {
    console.error('[API] Error fetching trips:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new trip in the database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      pickup,
      destination,
      distance,
      duration,
      price,
      vehicleType,
      passengerName,
      passengerPhone,
      status,
    } = body;

    if (!id || !pickup || !destination || !passengerName || !passengerPhone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await db.insert(schema.trips).values({
      id,
      pickup,
      pickupLat: 16.0544,
      pickupLng: 108.2022,
      destination,
      destLat: 16.0782,
      destLng: 108.2123,
      distance,
      duration,
      price,
      vehicleType,
      passengerName,
      passengerPhone,
      status: status || 'searching',
    });

    return NextResponse.json({ success: true, message: 'Trip created successfully' });
  } catch (error: any) {
    console.error('[API] Error creating trip:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Update trip status, driver, or cancellation details
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tripId, updates } = body;

    if (!tripId || !updates) {
      return NextResponse.json({ success: false, error: 'Missing tripId or updates' }, { status: 400 });
    }

    const updateData: any = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.cancellationFee !== undefined) updateData.cancellationFee = updates.cancellationFee;
    if (updates.cancelledAt) updateData.cancelledAt = new Date(updates.cancelledAt);

    if (updates.driver) {
      const dRes = await db
        .select()
        .from(schema.drivers)
        .where(eq(schema.drivers.phone, updates.driver.phone))
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
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId))
        .limit(1);
      if (existing.length > 0) {
        oldDriverId = existing[0].driverId;
      }
    }

    await db.update(schema.trips).set(updateData).where(eq(schema.trips.id, tripId));

    // If the trip is completed or cancelled, release the driver to be available again
    if (oldDriverId) {
      await db.update(schema.drivers).set({ isAvailable: true }).where(eq(schema.drivers.id, oldDriverId));
    }

    return NextResponse.json({ success: true, message: 'Trip updated successfully' });
  } catch (error: any) {
    console.error('[API] Error updating trip:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
