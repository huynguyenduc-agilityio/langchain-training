export interface RideIntent {
  category:
    | 'estimate'
    | 'request'
    | 'cancel'
    | 'view_trips'
    | 'faq'
    | 'unknown';
  confidence: number;
}
