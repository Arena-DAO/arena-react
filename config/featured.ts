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
          url: "overwatch-2",
          title: "Overwatch 2",
          img: "/category_images/overwatch-2.webp",
        },
        {
          url: "call-of-duty",
          title: "Call of Duty",
          img: "/category_images/call-of-duty.webp",
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
          addrs: [
            "juno1v9s28a6cewjqsdqhva27jl8kzm7h39j6rje90du5admp8n0xcneszexzn5",
          ],
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
      ],
    },
  ],
};

export const DAOMap = populateItemToMap(DAORoot);
