export type Live = {
  title: string;
  date: string;
  venue: string;
};

export type Artist = {
  name: string;
  liveCount: number;
  lastLiveDate: string;
  image: string;
  lives: Live[];
};