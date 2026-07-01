import { RideIntent } from '../types';

export const INTENT_TO_FLOW: Record<
  RideIntent['category'],
  'ride' | 'management' | 'info' | null
> = {
  estimate: 'ride',
  request: 'ride',
  cancel: 'management',
  view_trips: 'info',
  faq: 'info',
  unknown: null,
};

export const INTENT_TO_AGENT: Record<
  RideIntent['category'],
  'ride_agent' | 'management_agent' | 'info_agent'
> = {
  estimate: 'ride_agent',
  request: 'ride_agent',
  cancel: 'management_agent',
  view_trips: 'info_agent',
  faq: 'info_agent',
  unknown: 'info_agent', // Default info agent to handle chitchat/help
};
