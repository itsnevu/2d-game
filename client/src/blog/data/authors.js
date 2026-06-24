// Centralized author information
export const authors = {
  "Wilder": {
    name: "Wilder Team",
    image: "",
    twitter: "playwilder",
    bio: "The developer team behind WILDER."
  }
};

// Helper function to get author by name
export const getAuthor = (authorName) => {
  return authors[authorName] || null;
};
