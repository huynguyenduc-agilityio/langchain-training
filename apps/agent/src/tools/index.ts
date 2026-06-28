import { estimateRideTool } from './estimateRide';
import { requestRideTool } from './requestRide';
import { matchDriverTool } from './matchDriver';
import { lookupTripsTool } from './lookupTrips';
import {
  dummyRideConfirmTool,
  dummyCancelConfirmTool,
} from './dummyConfirmTools';
import { retrieveKnowledgeTool } from './retrieveKnowledge';

export {
  estimateRideTool,
  requestRideTool,
  matchDriverTool,
  lookupTripsTool,
  dummyRideConfirmTool,
  dummyCancelConfirmTool,
  retrieveKnowledgeTool,
};

export const tools = [
  estimateRideTool,
  requestRideTool,
  matchDriverTool,
  lookupTripsTool,
  dummyRideConfirmTool,
  dummyCancelConfirmTool,
  retrieveKnowledgeTool,
];
