import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
    addComment: (state, action) => {
      const { postId, comment } = action.payload;
      const updatedPosts = state.posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [...post.comments, comment],
          };
        }
        return post;
      });
      return {
        ...state,
        posts: updatedPosts,
      };
    },
  },
});

export const {
  setLogin,
  setLogout,
  setPosts,
  setPost,
  removePost,
  addComment,
} = authSlice.actions;

export default authSlice.reducer;
