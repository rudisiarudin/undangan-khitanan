export type EventType = 'PERNIKAHAN' | 'TUNANGAN' | 'KHITANAN';

export interface CoupleData {
  eventType: EventType;
  groomName: string;
  groomNickname: string;
  groomParents: string;
  brideName: string;
  brideNickname: string;
  brideParents: string;
  weddingDate: string;
  weddingTime: string;
  eventName?: string; // Custom name for the first event
  secondEventName?: string; // Custom name for the second event
  secondEventDate?: string; // distinct date for second event
  secondEventTime?: string; // distinct time for second event
  locationName: string;
  locationAddress: string;
  coverPhoto?: string;
  couplePhoto?: string;
  gallery?: string[];
  donation?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  multiDonations?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }[];
}

export interface GeneratedContent {
  quote: string;
  wetonAnalysis: string;
}

export enum ThemeType {
  SOLO = 'SOLO',
  JOGJA = 'JOGJA',
  MODERN = 'MODERN'
}