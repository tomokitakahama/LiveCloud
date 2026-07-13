type Live = {
  title: string;
  date: string;
  venue: string;
  openTime: string;
  startTime: string;
  liveType: string;
  seat: string;
  rating: number;
  memo: string;
  photos: string[];
  setlist: string[];
};

export type Artist = {
  name: string;
  liveCount: number;
  lastLiveDate: string;
  image: string;
  lives: Live[];
};