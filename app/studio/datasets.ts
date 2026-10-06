export type Dataset = {
  file: string;
  label: string;
  desc: string;
  source: string;
  truthCol?: string;
};

export const DATASETS: Dataset[] = [
  {
    file: "restaurant_sample.csv",
    label: "Restaurant",
    desc: "35 records · toy dedup demo",
    source: "built-in toy data",
    truthCol: "truth",
  },
  {
    file: "abt_buy.csv",
    label: "Abt-Buy",
    desc: "2,173 products · 1,076 entities · e-commerce",
    source: "Leipzig DB Group benchmark (CC), dbs.uni-leipzig.de",
    truthCol: "truth",
  },
  {
    file: "affiliations.csv",
    label: "Affiliations",
    desc: "2,260 affiliation strings · 330 clusters",
    source: "Leipzig DB Group benchmark (CC), dbs.uni-leipzig.de",
    truthCol: "truth",
  },
  {
    file: "cora.csv",
    label: "Cora",
    desc: "1,879 citations · 182 clusters · bibliography",
    source: "Cora benchmark (public), gold pairs supplied by Sam",
    truthCol: "truth",
  },
];
