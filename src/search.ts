export interface SearchDocument {
  title?: string | null;
  tags?: Array<string | null> | null;
  excerpt?: string | null;
  body?: string | null;
}

const getSearchRank = (document: SearchDocument, query: string): number => {
  const title = (document.title || "").toLocaleLowerCase();
  if (title.startsWith(query)) {
    return 0;
  }

  if (title.includes(query)) {
    return 1;
  }

  if ((document.tags || []).some((tag) => (tag || "").toLocaleLowerCase().includes(query))) {
    return 2;
  }

  if ((document.excerpt || "").toLocaleLowerCase().includes(query)) {
    return 3;
  }

  if ((document.body || "").toLocaleLowerCase().includes(query)) {
    return 4;
  }

  return -1;
};

export const rankSearchResults = <T>(items: T[], query: string,
  getDocument: (item: T) => SearchDocument): T[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return items.map((item, index) => ({
    item,
    index,
    rank: getSearchRank(getDocument(item), normalizedQuery),
  }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ item }) => item);
};
