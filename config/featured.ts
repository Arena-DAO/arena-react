import env from "./env";

export interface DAOItem {
  url: string;
  title?: string;
  children?: DAOItem[];
  addrs?: string[];
  img?: string;
}

function populateItemToMap(
  daoItem: DAOItem,
  daoMap: Map<string, DAOItem> = new Map()
): Map<string, DAOItem> {
  if (daoItem.url) daoMap.set(daoItem.url, daoItem);
  daoItem.children?.forEach((child) => populateItemToMap(child, daoMap));
  return daoMap;
}

export const DAORoot: DAOItem = {
  url: "",
  addrs: [env.ARENA_DAO_ADDRESS],
  children: [
    {
      url: "gaming",
      img: "/category_images/gaming.jpg",
      title: "Gaming",
      children: [
        {
          url: "fortnite",
          title: "Fortnite",
          img: "/category_images/fortnite.webp",
        },
        {
          url: "ea-sports-fc-24",
          title: "EA Sports FC 24",
          img: "/category_images/ea-sports-fc-24.webp",
          addrs: [
            "juno1npqq7rlqmuhev9r6r7lx0dd6gjuhtmdkcnrrfxmtyzmpkasdy53syjqhfj",
          ],
        },
        {
          url: "overwatch-2",
          title: "Overwatch 2",
          img: "/category_images/overwatch-2.webp",
        },
        {
          url: "rocket-league",
          title: "Rocket League",
          img: "/category_images/rocket-league.webp",
        },
        {
          url: "counter-strike",
          title: "Counter Strike",
          img: "/category_images/counter-strike.webp",
        },
        {
          url: "call-of-duty",
          title: "Call of Duty",
          img: "/category_images/call-of-duty.webp",
        },
        {
          url: "apex-legends",
          title: "Apex Legends",
          img: "/category_images/apex-legends.webp",
        },
      ],
    },
    {
      url: "sports",
      title: "Sports",
      img: "/category_images/sports.jpg",
      children: [
        {
          url: "soccer",
          title: "Soccer",
          img: "/category_images/soccer.jpg",
          addrs: [],
          children: [
            {
              url: "soccer-kc",
              img: "/category_images/soccer.jpg",
              title: "KC Soccer",
            },
          ],
        },
        { url: "tennis", title: "Tennis", img: "/category_images/tennis.jpg" },
        {
          url: "basketball",
          title: "Basketball",
          img: "/category_images/basketball.jpg",
        },
        {
          url: "baseball",
          title: "Baseball",
          img: "/category_images/baseball.webp",
        },
        {
          url: "volleyball",
          title: "Volleyball",
          img: "/category_images/volleyball.webp",
        },
      ],
    },
  ],
};

export const DAOMap = populateItemToMap(DAORoot);
