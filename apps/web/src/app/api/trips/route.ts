import type { NextRequest } from 'next/server';
import type { Driver, Trip, TripStatus, VehicleType } from '@repo/shared';
import { desc, eq } from 'drizzle-orm';
import { logError } from '@repo/logger';

import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Retrieve all trips from database for a specific user, sorted by newest first
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 },
      );
    }

    const allTrips = await db
      .select()
      .from(schema.trips)
      .where(eq(schema.trips.userId, userId))
      .orderBy(desc(schema.trips.createdAt));

    const resultTrips: Trip[] = [];

    for (const row of allTrips) {
      let driver: Driver | undefined;
      if (row.driverId) {
        const dRes = await db
          .select()
          .from(schema.drivers)
          .where(eq(schema.drivers.id, row.driverId))
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
        status: row.status as TripStatus,
        createdAt: row.createdAt
          ? row.createdAt.toISOString()
          : new Date().toISOString(),
        cancelledAt: row.cancelledAt
          ? row.cancelledAt.toISOString()
          : undefined,
        driver,
      });
    }

    return NextResponse.json({ success: true, trips: resultTrips });
  } catch (error) {
    const err = error as Error;
    logError(err, '[API] Error fetching trips:');
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// POST: Create a new trip in the database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      userId,
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

    if (
      !id ||
      !userId ||
      !pickup ||
      !destination ||
      !passengerName ||
      !passengerPhone
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Upsert the user first to avoid foreign key violations
    await db
      .insert(schema.users)
      .values({
        id: userId,
        name: passengerName,
        email: body.email || '',
      })
      .onConflictDoNothing();

    await db.insert(schema.trips).values({
      id,
      userId,
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

    return NextResponse.json({
      success: true,
      message: 'Trip created successfully',
    });
  } catch (error) {
    const err = error as Error;
    logError(err, '[API] Error creating trip:');
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// PATCH: Update trip status, driver, or cancellation details with owner verification
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tripId, userId, updates } = body;

    if (!tripId || !userId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing tripId, userId, or updates' },
        { status: 400 },
      );
    }

    const existing = await db
      .select()
      .from(schema.trips)
      .where(eq(schema.trips.id, tripId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Trip not found' },
        { status: 404 },
      );
    }

    // Security check: ensure user owns the trip being updated
    if (existing[0].userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Trip does not belong to this user',
        },
        { status: 403 },
      );
    }

    const updateData: {
      status?: TripStatus;
      cancelledAt?: Date;
      driverId?: string;
    } = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.cancelledAt)
      updateData.cancelledAt = new Date(updates.cancelledAt);

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

    const oldDriverId = existing[0].driverId;

    await db
      .update(schema.trips)
      .set(updateData)
      .where(eq(schema.trips.id, tripId));

    // If the trip is completed or cancelled, release the driver to be available again
    if (
      (updates.status === 'cancelled' || updates.status === 'completed') &&
      oldDriverId
    ) {
      await db
        .update(schema.drivers)
        .set({ isAvailable: true })
        .where(eq(schema.drivers.id, oldDriverId));
    }

    return NextResponse.json({
      success: true,
      message: 'Trip updated successfully',
    });
  } catch (error) {
    const err = error as Error;
    logError(err, '[API] Error updating trip:');
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
