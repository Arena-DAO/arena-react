export class DAOItem {
  url: string;
  title: string;
  children?: DAOItem[];
  addrs?: string[];

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
  title: "Main",
  children: [
    {
      url: "gaming",
      title: "Gaming",
      children: [
        {
          url: "fortnite",
          title: "Fortnite",
          addrs: ["x", "y", "z"],
        },
        {
          url: "overwatch-2",
          title: "Overwatch 2",
          addrs: ["x", "y", "z"],
        },
        {
          url: "call-of-duty",
          title: "Call of Duty",
          addrs: ["x", "y", "z"],
        },
      ],
    },
    {
      url: "sports",
      title: "Sports",
      children: [
        {
          url: "soccer",
          title: "Soccer",
          addrs: ["x", "y", "z"],
        },
        {
          url: "tennis",
          title: "Tennis",
          addrs: ["x", "y", "z"],
        },
        {
          url: "basketball",
          title: "Basketball",
          addrs: ["x", "y", "z"],
        },
      ],
    },
  ],
};
export const DAOMap = getDAOMap();
