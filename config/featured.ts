export class DAOItem {
  url: string;
  title?: string;
  children?: DAOItem[];
  addrs?: string[];
  img?: string | undefined;

  constructor(url: string, title: string) {
    this.url = url;
    this.title = title;
    this.children = [];
    this.addrs = [];
  }
}

function getDAOMap() {
  const daoMap = new Map<string, DAOItem>();
  mapDAOItem(daoMap, DAORoot);
  return daoMap;
}

function mapDAOItem(map: Map<string, DAOItem>, daoItem: DAOItem) {
  daoItem.children?.forEach((x) => {
    map.set(x.url, x);
    mapDAOItem(map, x);
  });
}

export const DAORoot: DAOItem = {
  url: "",
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
          img: "/category_images/overwatch-2.webp",
          title: "Overwatch 2",
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
        },
        {
          url: "tennis",
          title: "Tennis",
          img: "/category_images/tennis.jpg",
        },
        {
          url: "basketball",
          title: "Basketball",
          img: "/category_images/basketball.jpg",
        },
      ],
    },
  ],
};
export const DAOMap = getDAOMap();
