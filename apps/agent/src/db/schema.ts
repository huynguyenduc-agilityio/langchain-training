import {
  pgTable,
  text,
  timestamp,
  doublePrecision,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';

import { VEHICLE_TYPES } from '../constants';

export const tripStatusEnum = pgEnum('trip_status', [
  'searching',
  'matched',
  'picked_up',
  'completed',
  'cancelled',
]);
export const vehicleTypeEnum = pgEnum('vehicle_type', VEHICLE_TYPES);

export const drivers = pgTable('drivers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  vehicleInfo: text('vehicle_info').notNull(),
  vehicleType: vehicleTypeEnum('vehicle_type').notNull(),
  licensePlate: text('license_plate').notNull(),
  rating: doublePrecision('rating').default(5.0),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  isAvailable: boolean('is_available').default(true),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email'),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const trips = pgTable('trips', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  pickup: text('pickup').notNull(),
  pickupLat: doublePrecision('pickup_lat').notNull(),
  pickupLng: doublePrecision('pickup_lng').notNull(),
  destination: text('destination').notNull(),
  destLat: doublePrecision('dest_lat').notNull(),
  destLng: doublePrecision('dest_lng').notNull(),
  distance: doublePrecision('distance').notNull(),
  duration: doublePrecision('duration').notNull(),
  price: doublePrecision('price').notNull(),
  vehicleType: vehicleTypeEnum('vehicle_type').notNull(),
  passengerName: text('passenger_name').notNull(),
  passengerPhone: text('passenger_phone').notNull(),
  status: tripStatusEnum('status').default('searching'),
  driverId: text('driver_id').references(() => drivers.id),
  cancellationFee: doublePrecision('cancellation_fee'),
  createdAt: timestamp('created_at').defaultNow(),
  cancelledAt: timestamp('cancelled_at'),
});
