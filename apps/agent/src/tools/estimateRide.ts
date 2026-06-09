import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const estimateRideTool = tool(
  async ({ pickup, destination }) => {
    // Generate simulated distance (e.g. 3 to 23 km based on names length)
    const seed = ((pickup.length + destination.length) % 20) + 3;
    const distance = parseFloat(seed.toFixed(1));
    const duration = Math.round(distance * 1.5 + 5);

    // Calculate rates (USD):
    // Bike: base $1.0 + $0.5 per km
    // Car4: base $2.5 + $1.0 per km
    // Car7: base $4.0 + $1.5 per km
    const bikePrice = parseFloat((1.0 + distance * 0.5).toFixed(2));
    const car4Price = parseFloat((2.5 + distance * 1.0).toFixed(2));
    const car7Price = parseFloat((4.0 + distance * 1.5).toFixed(2));

    return {
      pickup,
      destination,
      distance,
      duration,
      options: [
        { vehicleType: 'bike', price: bikePrice },
        { vehicleType: 'car4', price: car4Price },
        { vehicleType: 'car7', price: car7Price },
      ],
    };
  },
  {
    name: 'estimateRide',
    description: 'Calculate ride distance, duration, and price estimates between pickup and destination.',
    schema: z.object({
      pickup: z.string().describe('Pickup location name (must be in Da Nang)'),
      destination: z.string().describe('Destination location name (must be in Da Nang)'),
    }),
  }
);
