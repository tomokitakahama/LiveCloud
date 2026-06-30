export type Live = {
  title: string;
  date: string;
  venue: string;

  rating?: number;
  memo?: string;
  photos?: string[];
};

export type Artist = {
  name: string;
  liveCount: number;
  lastLiveDate: string;
  image: string;
  lives: Live[];
};